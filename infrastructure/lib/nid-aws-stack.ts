import * as cdk from "aws-cdk-lib";
import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

interface NidAwsStackProps extends StackProps {
  environmentName: string;
}

export class NidAwsStack extends Stack {
  constructor(scope: Construct, id: string, props: NidAwsStackProps) {
    super(scope, id, props);

    const prefix = `nid-${props.environmentName}`;
    const removalPolicy = props.environmentName === "production" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY;

    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: `${prefix}-admins`,
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      passwordPolicy: {
        minLength: 12,
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: true,
        requireSymbols: true
      },
      removalPolicy
    });

    const userPoolClient = userPool.addClient("WebClient", {
      userPoolClientName: `${prefix}-web-client`,
      authFlows: {
        userPassword: true,
        userSrp: true
      },
      preventUserExistenceErrors: true
    });

    new cognito.CfnUserPoolGroup(this, "AdminGroup", {
      groupName: "Admin",
      userPoolId: userPool.userPoolId,
      description: "Administradores con permisos completos"
    });

    new cognito.CfnUserPoolGroup(this, "EditorGroup", {
      groupName: "Editor",
      userPoolId: userPool.userPoolId,
      description: "Editores de contenido y proyectos"
    });

    const projectsTable = this.table("ProjectsTable", `${prefix}-projects`, "id", removalPolicy);
    projectsTable.addGlobalSecondaryIndex({ indexName: "bySlug", partitionKey: { name: "slug", type: dynamodb.AttributeType.STRING } });
    projectsTable.addGlobalSecondaryIndex({
      indexName: "byStatus",
      partitionKey: { name: "status", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "createdAt", type: dynamodb.AttributeType.STRING }
    });
    projectsTable.addGlobalSecondaryIndex({
      indexName: "byCategory",
      partitionKey: { name: "categoryId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "createdAt", type: dynamodb.AttributeType.STRING }
    });
    projectsTable.addGlobalSecondaryIndex({
      indexName: "byFeatured",
      partitionKey: { name: "featured", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "createdAt", type: dynamodb.AttributeType.STRING }
    });

    const categoriesTable = this.table("CategoriesTable", `${prefix}-categories`, "id", removalPolicy);
    const contentTable = this.table("ContentTable", `${prefix}-site-content`, "section", removalPolicy);
    const contactTable = this.table("ContactRequestsTable", `${prefix}-contact-requests`, "id", removalPolicy);
    const settingsTable = this.table("SettingsTable", `${prefix}-site-settings`, "id", removalPolicy);
    const auditTable = this.table("AuditLogsTable", `${prefix}-audit-logs`, "id", removalPolicy);

    const uploadsBucket = new s3.Bucket(this, "UploadsBucket", {
      bucketName: undefined,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      removalPolicy,
      autoDeleteObjects: props.environmentName === "production" ? false : true,
      lifecycleRules: [
        {
          prefix: "tmp/",
          expiration: cdk.Duration.days(7)
        }
      ]
    });

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, "OriginAccessIdentity");
    uploadsBucket.grantRead(originAccessIdentity);

    const distribution = new cloudfront.Distribution(this, "ImagesDistribution", {
      defaultBehavior: {
        origin: new origins.S3Origin(uploadsBucket, { originAccessIdentity }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED
      },
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      enableLogging: true
    });

    const appRole = new iam.Role(this, "AmplifyRuntimeRole", {
      assumedBy: new iam.ServicePrincipal("amplify.amazonaws.com"),
      description: "Rol de referencia para acceso mínimo de la app a DynamoDB, S3 y CloudWatch"
    });

    for (const table of [projectsTable, categoriesTable, contentTable, contactTable, settingsTable, auditTable]) {
      table.grantReadWriteData(appRole);
    }
    uploadsBucket.grantReadWrite(appRole);
    appRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
        resources: ["*"]
      })
    );

    new logs.LogGroup(this, "ApiLogGroup", {
      logGroupName: `/aws/nid/${props.environmentName}/api`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy
    });

    const params: Record<string, string> = {
      userPoolId: userPool.userPoolId,
      userPoolClientId: userPoolClient.userPoolClientId,
      cloudFrontDomain: distribution.distributionDomainName,
      uploadsBucketName: uploadsBucket.bucketName,
      projectsTableName: projectsTable.tableName,
      categoriesTableName: categoriesTable.tableName,
      contentTableName: contentTable.tableName,
      contactRequestsTableName: contactTable.tableName,
      settingsTableName: settingsTable.tableName,
      auditLogsTableName: auditTable.tableName
    };

    Object.entries(params).forEach(([name, value]) => {
      new ssm.StringParameter(this, `${name}Param`, {
        parameterName: `/${prefix}/${name}`,
        stringValue: value
      });
      new cdk.CfnOutput(this, name, { value });
    });
  }

  private table(id: string, tableName: string, partitionKey: string, removalPolicy: RemovalPolicy) {
    return new dynamodb.Table(this, id, {
      tableName,
      partitionKey: { name: partitionKey, type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy
    });
  }
}

#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { NidAwsStack } from "../lib/nid-aws-stack";

const app = new cdk.App();
const environmentName = app.node.tryGetContext("environment") ?? "development";

new NidAwsStack(app, `Nid-${environmentName}-Stack`, {
  environmentName,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? process.env.AWS_REGION
  }
});

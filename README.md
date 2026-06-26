# NID Muebles

Aplicación web de NID para diseño, fabricación y montaje de muebles a medida. Incluye sitio público, catálogo, detalle de proyectos, formulario de presupuestos y panel administrativo.

## Arquitectura AWS

```text
Usuario -> AWS Amplify Hosting -> Next.js App Router
Next.js API Routes -> Cognito JWT -> DynamoDB / S3 / CloudWatch
Admin -> Cognito User Pool (Admin, Editor)
Imágenes -> S3 privado -> CloudFront -> Next/Image
Dominio -> Route 53 o proveedor externo -> Amplify + ACM HTTPS
Secretos y parámetros -> SSM Parameter Store / Secrets Manager
```

Servicios usados:

- AWS Amplify Hosting para SSR/SSG/rutas API de Next.js.
- Amazon Cognito User Pools para autenticación administrativa.
- Amazon DynamoDB para proyectos, categorías, contenido, consultas, configuración y auditoría.
- Amazon S3 privado para imágenes.
- Amazon CloudFront para servir imágenes.
- AWS CDK con TypeScript para infraestructura.
- CloudWatch para logs.
- Route 53 y ACM para dominio y HTTPS.

## Requisitos

- Node.js `>=20 <23`.
- npm.
- AWS CLI configurado.
- AWS CDK CLI.
- Cuenta AWS con permisos para crear Cognito, DynamoDB, S3, CloudFront, IAM, SSM y logs.

## Variables de entorno

Copiá `.env.example` a `.env.local`.

Públicas, disponibles en navegador:

```bash
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_AWS_REGION=
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=
NEXT_PUBLIC_CLOUDFRONT_DOMAIN=
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

Servidor:

```bash
AWS_REGION=
PROJECTS_TABLE_NAME=
CATEGORIES_TABLE_NAME=
SITE_CONTENT_TABLE_NAME=
CONTACT_REQUESTS_TABLE_NAME=
SITE_SETTINGS_TABLE_NAME=
AUDIT_LOGS_TABLE_NAME=
UPLOADS_BUCKET_NAME=
CLOUDFRONT_DOMAIN=
```

No agregues Access Key ID, Secret Access Key, tokens, contraseñas ni secretos al repositorio.

## Desarrollo local

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

Sin variables AWS, algunas pantallas usan datos demo para mantener navegable el sitio público.

## Infraestructura CDK

```bash
cd infrastructure
npm install
npm run build
npx cdk bootstrap
npx cdk synth
npx cdk deploy -c environment=development
```

Para producción:

```bash
npx cdk deploy -c environment=production
```

El stack crea:

- Cognito User Pool.
- Cognito App Client.
- Grupos `Admin` y `Editor`.
- Tablas DynamoDB `nid-{environment}-projects`, `categories`, `site-content`, `contact-requests`, `site-settings`, `audit-logs`.
- S3 privado con versionado, cifrado, bloqueo público y lifecycle para `tmp/`.
- CloudFront para imágenes.
- Rol IAM de referencia con permisos mínimos para DynamoDB, S3 y CloudWatch.
- Log Group de CloudWatch.
- Parámetros SSM y outputs con nombres de recursos.

Las tablas usan varias tablas porque las entidades tienen ciclos de vida, permisos y patrones de consulta distintos. Esto simplifica permisos IAM, backups, auditoría y costos por entidad.

## Primer administrador

1. Abrir Cognito en AWS Console.
2. Entrar al User Pool creado por CDK.
3. Crear usuario con email.
4. Agregarlo al grupo `Admin`.
5. Definir contraseña temporal.
6. En el primer ingreso, Cognito puede exigir cambio de contraseña. El flujo queda detectado; se recomienda completar el challenge desde Hosted UI o ampliar la pantalla `/admin/login` con formulario de nueva contraseña.

## Despliegue en Amplify

1. Subir el repositorio a GitHub.
2. Entrar a AWS Amplify.
3. Seleccionar `Host web app`.
4. Conectar GitHub.
5. Elegir repositorio y rama.
6. Revisar `amplify.yml`.
7. Configurar variables de entorno públicas y de servidor.
8. Ejecutar el primer build.
9. Revisar logs.
10. Activar despliegue automático en la rama principal.
11. Configurar previews para pull requests si el flujo lo requiere.

No uses export estático: el proyecto necesita SSR, rutas API, autenticación y panel administrativo.

## Dominio

Route 53:

1. Registrar o transferir dominio a Route 53.
2. En Amplify, agregar dominio.
3. Elegir dominio raíz y `www`.
4. Amplify gestiona certificado ACM y registros DNS.
5. Configurar redirección entre raíz y `www`.
6. Actualizar `NEXT_PUBLIC_SITE_URL`.

Proveedor externo:

1. Agregar dominio en Amplify.
2. Copiar registros CNAME/TXT indicados.
3. Configurarlos en el proveedor.
4. Esperar validación ACM.
5. Configurar `www` y redirección.

## Seguridad

- Cognito emite JWT.
- Los endpoints `/api/admin/*` verifican JWT, expiración y grupo.
- `Admin` puede eliminar y modificar configuración.
- `Editor` puede crear, editar, publicar, modificar contenido y ver consultas.
- DynamoDB y S3 no se acceden desde el navegador con credenciales permanentes.
- S3 permanece privado; las subidas usan URLs prefirmadas.
- Encabezados HTTP seguros configurados en `next.config.ts`.
- Rate limiting básico en memoria para contacto y presigned URLs.

Para producción de alto tráfico, sumar AWS WAF, API Gateway throttling, App Runner/Lambda dedicado o TTL en DynamoDB para rate limiting distribuido.

## Imágenes

Flujo:

1. Admin selecciona JPG, PNG o WEBP.
2. El servidor valida MIME/tamaño.
3. Se genera URL prefirmada.
4. El navegador sube directo a S3.
5. Se guarda la key en DynamoDB.
6. La lectura se hace vía CloudFront.

No guardes URLs prefirmadas en DynamoDB porque expiran.

## Costos aproximados

Pueden generar cargos: Amplify Hosting build/hosting, Cognito MAU si supera capa gratuita, DynamoDB on-demand, S3 storage/requests, CloudFront transferencia, CloudWatch logs, Route 53 hosted zone/dominio y ACM público normalmente sin costo directo cuando se usa con servicios AWS compatibles.

## Eliminación segura

Para entornos de desarrollo:

```bash
cd infrastructure
npx cdk destroy -c environment=development
```

En producción, CDK usa `RETAIN` para reducir riesgo de pérdida accidental. Revisá manualmente S3, DynamoDB y backups antes de eliminar.

## Troubleshooting

- Login falla: revisar `NEXT_PUBLIC_COGNITO_USER_POOL_ID`, client ID y grupo Cognito.
- API admin devuelve 403: el usuario no pertenece a `Admin` o `Editor`.
- Imágenes no cargan: revisar `NEXT_PUBLIC_CLOUDFRONT_DOMAIN` y `next.config.ts`.
- Build Amplify falla: confirmar Node 20/22 y variables de entorno.
- CDK synth falla: ejecutar `npm install` dentro de `infrastructure`.

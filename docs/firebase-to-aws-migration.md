# Migración de Firebase a AWS

Este proyecto fue preparado para no depender de Firebase.

## Sustituciones realizadas

- Firebase Authentication fue reemplazado por Amazon Cognito User Pools.
- Cloud Firestore fue reemplazado por Amazon DynamoDB.
- Firebase Storage fue reemplazado por Amazon S3 privado con URLs prefirmadas.
- Firebase Hosting fue reemplazado por AWS Amplify Hosting.
- Las reglas `firestore.rules` y `storage.rules` fueron eliminadas.
- Las variables `NEXT_PUBLIC_FIREBASE_*` fueron eliminadas de `.env.example`.
- Los servicios cliente ya no importan Firebase.

## Nuevas piezas

- `src/lib/aws/*`: configuración AWS, DynamoDB y S3.
- `src/lib/auth/cognito.ts`: verificación JWT de Cognito para endpoints admin.
- `src/services/server/*Repository.ts`: repositorios por entidad.
- `src/app/api/*`: endpoints públicos y administrativos.
- `infrastructure/`: AWS CDK con Cognito, DynamoDB, S3, CloudFront, IAM, SSM y logs.
- `amplify.yml`: build para AWS Amplify Hosting.

## Pasos manuales posibles

Si existieran datos reales en Firebase:

1. Exportar colecciones de Firestore.
2. Transformar documentos al modelo DynamoDB.
3. Subir imágenes de Firebase Storage a S3.
4. Guardar `bucket`, `key`, `alt` y `order` en DynamoDB.
5. Crear usuarios en Cognito y asignar grupos.
6. Validar permisos Admin/Editor.
7. Comparar slugs públicos para no romper URLs existentes.

No se borra ningún dato externo automáticamente.

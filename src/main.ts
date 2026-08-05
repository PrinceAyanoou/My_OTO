import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { clerkMiddleware } from '@clerk/express';
import { ZodValidationPipe } from 'nestjs-zod';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Activation du middleware Clerk globalement
  app.use(clerkMiddleware());

  // Activation la validation automatique de Zod sur toute l'application
  app.useGlobalPipes(new ZodValidationPipe());

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('API (Backend) My_OTO')
    .setDescription('Documentation interactive des endpoints')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'clerk-auth',
    ) // Activer le bouton Bearer Auth dans Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('My_OTO/api', app, document);

  // Active le CORS pour autoriser le frontend React/Next.js à faire des requêtes
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

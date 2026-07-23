import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { clerkMiddleware } from '@clerk/express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activation du middleware Clerk globalement
  app.use(clerkMiddleware());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

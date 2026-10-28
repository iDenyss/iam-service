// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors() 
  const config = new DocumentBuilder()
    .setTitle('IAM Service')
    .setDescription('API del servicio de Identity and Access Management')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 4002);
  console.log(`Servicio IAM corriendo en: http://localhost:${process.env.PORT || 4002}`);
  console.log(`Documentación Swagger en: http://localhost:${process.env.PORT || 4002}/api/docs`);
}
bootstrap();
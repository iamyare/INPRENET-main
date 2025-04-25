import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
const express = require('express');
import * as dotenv from 'dotenv';


dotenv.config();

async function bootstrap() {
  // Lee los archivos del certificado y la clave privada --LOCAL--
  /* const httpsOptions = {
    key: fs.readFileSync(process.env.PRIVATE_KEY), // Ruta al archivo de clave privada
    cert: fs.readFileSync(process.env.CERTIFICATE), // Ruta al archivo de certificado
  }; */

  // Lee los archivos del certificado y la clave privada --PRODUCCION--
  /* const httpsOptions = {
    pfx: fs.readFileSync(process.env.CERTIFICATE || ''),
    passphrase: process.env.PASSPHRASE || '',
  }; */

  // Crea la aplicación con HTTPS
  const app = await NestFactory.create(AppModule, {
    //httpsOptions,
  });

  app.enableCors({
    origin: process.env.BACKEND_HOST,
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const errorMessages = errors.flatMap((error) => {
          if (error.children?.length > 0) {
            return error.children.flatMap((nestedError, index) => {
              return nestedError.children.map((childError) => {
                return `${error.property}[${index}].${childError.property} - ${Object.values(
                  childError.constraints
                ).join(', ')}`;
              });
            });
          }
          return `${error.property} - ${Object.values(error.constraints).join(', ')}`;
        });

        return new BadRequestException(errorMessages);
      }
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Documentación de INPRENET (backend)')
    .setDescription('Documentación de las rutas del backend.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(cookieParser());
  app.use(express.json({ limit: '8mb' }));

  // Cambia el puerto si es necesario
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Servidor ejecutándose en el puerto: ${port}`);
}
bootstrap();

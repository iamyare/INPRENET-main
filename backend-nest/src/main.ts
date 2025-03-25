import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
import * as net from 'net';
const express = require('express');
import * as dotenv from 'dotenv';

dotenv.config();

// Función para verificar si un puerto está disponible
async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// Función para encontrar un puerto disponible
async function findAvailablePort(startPort: number, maxAttempts: number = 10): Promise<number> {
  let port = startPort;
  let attempts = 0;

  while (attempts < maxAttempts) {
    if (await isPortAvailable(port)) {
      return port;
    }
    port++;
    attempts++;
  }
  
  throw new Error(`No se pudo encontrar un puerto disponible después de ${maxAttempts} intentos`);
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');

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
    origin: process.env.BACKEND_HOST || 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

  // Obtener el puerto preferido desde las variables de entorno
  const preferredPort = parseInt(process.env.PORT || '3000', 10);
  
  try {
    // Intentar encontrar un puerto disponible
    const port = await findAvailablePort(preferredPort);
    
    await app.listen(port);
    logger.log(`🚀 Servidor ejecutándose en el puerto: ${port}`);
    
    // Actualizar la información de la URL si es diferente del puerto preferido
    if (port !== preferredPort) {
      logger.warn(`⚠️ El puerto ${preferredPort} estaba ocupado. Usando puerto alternativo: ${port}`);
      logger.log(`📌 URL de la API: http://localhost:${port}/api`);
      logger.log(`📚 Documentación: http://localhost:${port}/docs`);
    }
  } catch (error) {
    logger.error(`Error al iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  // 🛡️ สร้างแอป
  const app = await NestFactory.create(AppModule);

  // 🧠 กำหนดขนาด body สูงสุด เช่น 10MB (ป้องกัน 413 Request Entity Too Large)
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // 🌍 เปิด CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // 🛠️ โหลด ENV
  const configService = app.get(ConfigService);

  // 📘 Swagger Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Product Service')
    .setDescription('API for managing products')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // 🐇 RabbitMQ Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        configService.get<string>('RABBITMQ_URL') ?? 'amqp://localhost:5672',
      ],
      queue: configService.get<string>('QUEUE_NAME') ?? 'product_queue',
      queueOptions: { durable: false },
    },
  });

  // ✅ Start microservice + API
  await app.startAllMicroservices();
  const port = configService.get<number>('PORT') ?? 3002;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Product Service is running on port ${port}`);
}
bootstrap();

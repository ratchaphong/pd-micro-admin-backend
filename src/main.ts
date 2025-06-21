import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  const configService = app.get(ConfigService);

  // ✅ Swagger
  const config = new DocumentBuilder()
    .setTitle('Product Service')
    .setDescription('API for managing products')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // ✅ RabbitMQ
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

  await app.startAllMicroservices();

  const port = configService.get<number>('PORT') ?? 3002;
  await app.listen(port, '0.0.0.0'); // ✅ listen ทุก IP (local + docker)
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Stock-back-end')
    .setDescription('The API of stock server')
    .setVersion('1.0')
    .addTag('Investor')
    .addTag('Stock')
    .addTag('Order')
    .addTag('Transaction')
    .addServer('140.118.127.145:8080')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('document', app, document);

  await app.listen(3000);
}
bootstrap();

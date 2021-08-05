import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

const runSwagger = (
  app: NestExpressApplication,
  host: string,
  port: number,
) => {
  const config = new DocumentBuilder()
    .setTitle('Stock-back-end')
    .setDescription('The API of stock server')
    .setVersion('1.0')
    .addTag('Investor')
    .addTag('Stock')
    .addTag('Order')
    .addTag('Transaction')
    .addTag('Display')
    .addServer(`http://${host}:${port}`)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('document', app, document);
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();

  const configService = app.get(ConfigService);

  runSwagger(app, configService.get('HOST'), configService.get('PORT'));

  await app.listen(configService.get('PORT'), () => {
    console.log(
      'Nest application is running on ' + configService.get('PORT') + ' port',
    );
  });
}
bootstrap();

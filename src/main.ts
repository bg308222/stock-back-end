import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './exception-filter/exception-filter';
import { MatchService } from './module/match/match.service';

const runSwagger = (app: NestExpressApplication, swaggerServer: string) => {
  const config = new DocumentBuilder()
    .setTitle('Stock-back-end')
    .setDescription('The API of stock server')
    .setVersion('1.0')
    .addTag('Investor')
    .addTag('Stock')
    .addTag('Order')
    .addTag('VirtualOrder')
    .addTag('Transaction')
    .addTag('Display')
    .addTag('Group')
    .addTag('RealData Stock')
    .addTag('RealData Futures')
    .addTag('Rbac')
    .addTag('Available')
    .addServer(swaggerServer)
    .addSecurity('login', {
      type: 'apiKey',
      name: 'token',
      in: 'header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('document', app, document);
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(json({ limit: '10mb' }));
  app.setGlobalPrefix('api');
  app.enableCors();

  const configService = app.get(ConfigService);
  const matchService = app.get(MatchService);
  await matchService.init();

  runSwagger(app, configService.get('SWAGGER_SERVER'));

  await app.listen(configService.get('PORT'), () => {
    console.log(
      'Nest application is running on ' + configService.get('PORT') + ' port',
    );
  });
}
bootstrap();

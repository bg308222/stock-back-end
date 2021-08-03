import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { entities } from './core/entity';
import { InvestorModule } from './module/investor/investor.module';
import { StockModule } from './module/stock/stock.module';
import { OrderModule } from './module/order/order.module';
import { TransactionModule } from './module/transaction/transaction.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } =
          process.env;
        return {
          type: 'mysql',
          host: DB_HOST,
          port: +DB_PORT,
          username: DB_USERNAME,
          password: DB_PASSWORD,
          database: DB_NAME,
          entities,
          synchronize: true,
          autoLoadEntities: true,
        };
      },
    }),
    InvestorModule,
    StockModule,
    OrderModule,
    TransactionModule,
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

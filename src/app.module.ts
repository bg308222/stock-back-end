import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { entities } from './database/entity';
import { InvestorModule } from './module/investor/investor.module';
import { StockModule } from './module/stock/stock.module';
import { OrderModule } from './module/order/order.module';
import { TransactionModule } from './module/transaction/transaction.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '12345',
      database: 'stock-back-end',
      entities,
      synchronize: true,
      autoLoadEntities: true,
    }),
    InvestorModule,
    StockModule,
    OrderModule,
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

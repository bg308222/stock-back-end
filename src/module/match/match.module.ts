import { forwardRef, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Display } from 'src/common/entity/display.entity';
import { Order } from 'src/common/entity/order.entity';
import { Stock } from 'src/common/entity/stock.entity';
import { Transaction } from 'src/common/entity/transaction.entity';
import { DisplayModule } from '../display/display.module';
import { OrderModule } from '../order/order.module';
import { OrderService } from '../order/order.service';
import { StockModule } from '../stock/stock.module';
import { TransactionModule } from '../transaction/transaction.module';
import { MatchService } from './match.service';

@Global()
@Module({
  imports: [
    TransactionModule,
    DisplayModule,
    OrderModule,
    forwardRef(() => StockModule),
  ],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}

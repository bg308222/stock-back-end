import { forwardRef, Global, Module } from '@nestjs/common';
import { DisplayModule } from '../display/display.module';
import { OrderModule } from '../order/order.module';
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

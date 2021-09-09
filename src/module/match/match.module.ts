import { forwardRef, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stock } from 'src/common/entity/stock.entity';
import { DisplayModule } from '../display/display.module';
import { OrderModule } from '../order/order.module';
import { TransactionModule } from '../transaction/transaction.module';
import { MatchService } from './match.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Stock]),
    TransactionModule,
    DisplayModule,
    OrderModule,
  ],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}

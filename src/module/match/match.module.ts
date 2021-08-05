import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Display } from 'src/common/entity/display.entity';
import { Order } from 'src/common/entity/order.entity';
import { Transaction } from 'src/common/entity/transaction.entity';
import { DisplayModule } from '../display/display.module';
import { TransactionModule } from '../transaction/transaction.module';
import { MatchService } from './match.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Transaction, Display]),
    TransactionModule,
    DisplayModule,
  ],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}

import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/common/entity/order.entity';
import { Transaction } from 'src/common/entity/transaction.entity';
import { MatchService } from './match.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Order, Transaction])],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}

import { forwardRef, Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stock } from 'src/common/entity/stock.entity';
import { MatchModule } from '../match/match.module';
import { OrderModule } from '../order/order.module';
import { VirtualOrderContainer } from 'src/common/entity/virtualOrderContainer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock, VirtualOrderContainer]),
    OrderModule,
    forwardRef(() => MatchModule),
  ],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}

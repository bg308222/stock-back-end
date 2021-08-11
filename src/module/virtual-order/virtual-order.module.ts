import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VirtualOrder } from 'src/common/entity/virtualOrder.entity';
import { VirtualOrderContainer } from 'src/common/entity/virtualOrderContainer.entity';
import { MatchModule } from '../match/match.module';
import { MatchService } from '../match/match.service';
import { VirtualOrderController } from './virtual-order.controller';
import { VirtualOrderService } from './virtual-order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([VirtualOrder, VirtualOrderContainer]),
    MatchModule,
  ],
  controllers: [VirtualOrderController],
  providers: [VirtualOrderService],
})
export class VirtualOrderModule {}

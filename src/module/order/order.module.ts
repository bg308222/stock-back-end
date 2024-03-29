import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/common/entity/order.entity';
import { Display } from 'src/common/entity/display.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Display])],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}

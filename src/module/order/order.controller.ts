import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IOrderBody, IOrderQuery, IOrderQueryResponse } from './order.dto';
import { OrderService } from './order.service';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiResponse({ type: IOrderQueryResponse, status: 200 })
  @Get()
  public async get(@Query() query: IOrderQuery) {
    return this.orderService.get(query);
  }

  @ApiResponse({ type: Number, status: 200 })
  @ApiBody({ type: [IOrderBody] })
  @Post()
  public async insert(@Body() body: IOrderBody[]) {
    await this.orderService.insert(body);
    return 1;
  }
}

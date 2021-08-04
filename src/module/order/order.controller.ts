import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MatchService } from '../match/match.service';
import { IOrderBody, IOrderQuery, IOrderQueryResponse } from './order.dto';
import { OrderService } from './order.service';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly matchService: MatchService,
  ) {}

  @ApiResponse({ type: IOrderQueryResponse, status: 200 })
  @Get()
  public async get(@Query() query: IOrderQuery) {
    return this.orderService.get(query);
  }

  @ApiResponse({ type: Number, status: 200 })
  @ApiBody({ type: [IOrderBody] })
  @Post()
  public async insert(@Body() body: IOrderBody) {
    const { generatedMaps } = await this.orderService.insert(body);
    this.matchService.dispatchOrder({
      id: generatedMaps[0].id,
      createdTime: generatedMaps[0].createdTime,
      orderId: generatedMaps[0].orderId,
      ...body,
    });
    return 1;
  }
}

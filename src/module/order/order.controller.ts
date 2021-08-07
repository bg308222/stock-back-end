import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MatchService } from '../match/match.service';
import {
  IOrderDelete,
  IOrderInsert,
  IOrderQuery,
  IOrderQueryResponse,
} from './order.dto';
import { OrderService } from './order.service';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly matchService: MatchService,
  ) {}

  @ApiResponse({ type: IOrderQueryResponse, status: 200 })
  @ApiOperation({
    summary: '目前好像沒地方要顯示這個',
  })
  @Get()
  public async get(@Query() query: IOrderQuery) {
    return this.orderService.get(query);
  }

  @ApiResponse({ type: Number, status: 200 })
  @ApiOperation({
    summary: '發出委託',
    description:
      'investorId, stockId先傳1，等未來實作完stock跟investor再調成動態的',
  })
  @Post()
  public async insert(@Body() body: IOrderInsert) {
    const order = await this.orderService.insert(body);
    await this.matchService.dispatchOrder(order);
    return true;
  }

  @ApiOperation({
    summary: '取消委託',
  })
  @Delete()
  public async delete(@Body() body: IOrderDelete) {
    const order = await this.orderService.delete(body);
    const result = await this.matchService.dispatchOrder(order);
    if (result === false) this.orderService.updateStatusToFail(order.id);
    return result;
  }
}

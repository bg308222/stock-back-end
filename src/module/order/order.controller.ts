import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  MethodEnum,
  OrderStatusEnum,
  PriceTypeEnum,
  SubMethodEnum,
  TimeRestrictiomEnum,
} from 'src/common/enum';
import { MatchService } from '../match/match.service';
import {
  IOrderDelete,
  IOrderInsert,
  IOrderQuery,
  IOrderQueryResponse,
} from './order.dto';
import { OrderService } from './order.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Display } from 'src/common/entity/display.entity';
import { Repository } from 'typeorm';
import { CommonQuery } from 'src/common/type';
@ApiTags('Order')
@ApiSecurity('login')
@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly matchService: MatchService,
    @InjectRepository(Display)
    private readonly displayRepository: Repository<Display>,
  ) {
    this.latestTime = {};
  }

  private latestTime: Record<string, number>;

  @ApiResponse({ type: IOrderQueryResponse, status: 200 })
  @Get()
  public async get(@Query() query: IOrderQuery) {
    return await this.orderService.get(query);
  }

  @ApiResponse({ type: Number, status: 200 })
  @ApiOperation({
    summary: '發出委託',
    description:
      'investorId, stockId先傳1，等未來實作完stock跟investor再調成動態的',
  })
  @Post()
  public async insert(@Body() body: IOrderInsert, @Query() query: CommonQuery) {
    if (body.investorId === undefined) {
      body.investorId = query.investor.id;
    }

    if (body.createdTime) {
      this.latestTime[body.stockId] = new Date(body.createdTime).getTime() + 1;
    }

    if (body.isAutoTime === true && this.latestTime[body.stockId]) {
      body.createdTime = new Date(this.latestTime[body.stockId]++);
    }

    body.stockId = body.stockId.toString().trim();
    const id = await this.orderService.insert(body);
    const result = await this.matchService.dispatchOrder({ ...body, id });
    return result;
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

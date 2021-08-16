import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MatchService } from '../match/match.service';
import { OrderService } from '../order/order.service';
import {
  IStockQuery,
  IStockQueryResponse,
  IStockReset,
  IStockResetResponse,
  IStockUpdate,
} from './stock.dto';
import { StockService } from './stock.service';

@ApiTags('Stock')
@Controller('stock')
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly matchService: MatchService,
    private readonly orderService: OrderService,
  ) {}

  @ApiResponse({ type: IStockQueryResponse, status: 200 })
  @Get()
  public async get(@Query() query: IStockQuery) {
    return await this.stockService.get(query);
  }

  @ApiOperation({
    summary: '更新股票資訊',
    description: 'id必傳，為需要更改的股票',
  })
  @Put()
  public async update(@Body() body: IStockUpdate) {
    await this.stockService.update(body);
    return true;
  }

  @ApiOperation({
    summary: '重製股票',
    description: 'createdTimed可不傳，會直接重製至最初狀態',
  })
  @ApiResponse({
    type: IStockResetResponse,
    status: 200,
  })
  @Put('reset')
  public async reset(@Body() { id, createdTime, isReset }: IStockReset) {
    const { orders, marketBook, marketName } =
      await this.matchService.getReplayOrdersAndMarketBook(
        id,
        createdTime,
        isReset,
      );

    if (isReset === true) {
      const display = await this.matchService.setMarketBook(id, marketBook);
      return {
        display,
      };
    } else {
      const display = await this.matchService.setMarketBook(
        id,
        marketBook,
        marketName,
      );
      return {
        orders,
        display,
      };
    }
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IMarketBook } from '../match/match.helper';
import { MatchService } from '../match/match.service';
import { OrderService } from '../order/order.service';
import {
  IStockDelete,
  IStockInsert,
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
  ) {}

  @ApiResponse({ type: IStockQueryResponse, status: 200 })
  @Get()
  public async get(@Query() query: IStockQuery) {
    return await this.stockService.get(query);
  }

  @ApiOperation({
    summary: '新增股票',
    description: 'id必傳，為需要更改的股票',
  })
  @Post()
  public async insert(@Body() body: IStockInsert) {
    return await this.stockService.insert(body);
  }

  @ApiOperation({
    summary: '更新股票資訊',
    description: 'id必傳，為需要更改的股票',
  })
  @Put()
  public async update(@Body() body: IStockUpdate) {
    return await this.stockService.update(body);
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
  public async reset(
    @Body()
    {
      id,
      startTime,
      replayTime,
      endTime,
      isReset,
      virtualOrderContainerId,
      isAutoDisplay,
    }: IStockReset,
  ) {
    if (id === undefined) throw new BadRequestException('Missing id');
    const { orders, marketBook, marketName } =
      await this.matchService.getReplayOrdersAndMarketBook(
        id,
        startTime,
        replayTime,
        endTime,
        isReset,
      );

    if (isReset === true) {
      let newMarketBook: IMarketBook = undefined;

      if (virtualOrderContainerId !== undefined) {
        newMarketBook = await this.stockService.getVirtualOrderContainer(
          virtualOrderContainerId,
        );
      }

      const display = await this.matchService.setMarketBook(
        id,
        newMarketBook || marketBook,
        undefined,
        isAutoDisplay,
      );
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

  @Delete()
  public async delete(@Body() body: IStockDelete) {
    return await this.stockService.delete(body);
  }
}

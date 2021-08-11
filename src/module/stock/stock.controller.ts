import { Body, Controller, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MatchService } from '../match/match.service';
import { IStockReset, IStockResetResponse } from './stock.dto';
import { StockService } from './stock.service';

@ApiTags('Stock')
@Controller('stock')
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly matchService: MatchService,
  ) {}

  @ApiOperation({
    summary: '重製股票',
    description: 'createdTimed可不傳，會直接重製至最初狀態',
  })
  @ApiResponse({
    type: IStockResetResponse,
    status: 200,
  })
  @Put('reset')
  public async reset(@Body() { id, createdTime }: IStockReset) {
    const { orders, marketBook } =
      await this.matchService.getReplayOrdersAndMarketBook(id, createdTime);

    await this.matchService.setMarketBook(id, marketBook);
    return {
      orders,
    };
  }
}

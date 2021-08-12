import { Body, Controller, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { transferDisplayToReturnType } from '../display/display.service';
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
    const { orders, marketBook, marketName } =
      await this.matchService.getReplayOrdersAndMarketBook(id, createdTime);

    //TODO 將marketName傳進setMarketBook
    // await this.matchService.setMarketBook(id, marketBook, marketName);
    const display = await this.matchService.setMarketBook(id, marketBook);
    return {
      orders,
      display: transferDisplayToReturnType(display as any),
    };
  }
}

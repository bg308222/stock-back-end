import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { getTickRange } from '../match/match.service';
import { IDisplayQuery, IDisplayQueryResponse } from './display.dto';
import { DisplayService } from './display.service';

@ApiTags('Display')
@Controller('display')
export class DisplayController {
  constructor(private readonly displayService: DisplayService) {}

  @ApiResponse({ type: IDisplayQueryResponse, status: 200 })
  @ApiOperation({
    summary: '前端展示圖表用(K線、分時走勢、五檔報價圖)',
    description:
      'matchPrice為成交價，用來繪製線圖。若index = i,則tickRange[i]的值為價格,buyTick[i]和sellTick[i]的值為該價格下，買單和賣單的數量',
  })
  @Get()
  public async get(@Query() query: IDisplayQuery) {
    const result = await this.displayService.get(query);
    return result;
  }

  @Get('tickRange')
  @ApiOperation({
    summary:
      '若display中沒有資料或tickRange為空陣列，則要先call這一支來獲取報價資訊',
    description: '根據收盤價，得到該市場可以交易的價格',
  })
  @ApiQuery({
    name: 'closedPrice',
    type: Number,
    example: 150,
  })
  public async getTickRange(@Query('closedPrice') closedPrice: number) {
    return getTickRange(closedPrice).tickRange;
  }
}

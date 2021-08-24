import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  IDisplayChartQuery,
  IDisplayChartQueryResponse,
  IDisplayQuery,
  IDisplayQueryResponse,
} from './display.dto';
import { DisplayService } from './display.service';

@ApiTags('Display')
@Controller('display')
export class DisplayController {
  constructor(private readonly displayService: DisplayService) {}

  @ApiResponse({ type: IDisplayQueryResponse, status: 200 })
  @ApiOperation({
    summary: '前端展示圖表用(五檔報價圖)',
    description:
      'matchPrice為成交價，用來繪製線圖。若index = i,則tickRange[i]的值為價格,buyTick[i]和sellTick[i]的值為該價格下，買單和賣單的數量',
  })
  @Get()
  public async get(@Query() query: IDisplayQuery) {
    const result = await this.displayService.get(query);
    return result;
  }

  @ApiResponse({ schema: IDisplayChartQueryResponse, status: 200 })
  @ApiOperation({
    summary: '前端展示圖表用(K線、分時走勢)',
  })
  @Get('chart')
  public async getChart(@Query() query: IDisplayChartQuery) {
    if (query.stockId === undefined)
      throw new BadRequestException('Missing.stockId');
    if (query.dateFormat === undefined)
      throw new BadRequestException('Missing dateFormat');
    return await this.displayService.getChart(query);
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
      'page傳{"page":1,"pageSize":1}來取得最新一筆資料，五檔的資料在buy/sellFiveTick中\n',
  })
  @Get()
  public async get(@Query() query: IDisplayQuery) {
    const result = await this.displayService.get(query);
    return result;
  }
}

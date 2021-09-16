import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import {
  IRealDataDisplayContentInsert,
  IRealDataDisplayContentQuery,
  IRealDataObjectResponse,
  IRealDataOrderContentInsert,
  IRealDataOrderContentQuery,
  IRealDataQuery,
  REAL_DATA_API_BODY,
  REAL_DATA_CONTENT_API_BODY,
} from './real-data-dto';
import { RealDataService } from './real-data.service';

@ApiTags('RealData')
@Controller('real-data')
export class RealDataController {
  constructor(private readonly realDataService: RealDataService) {}

  @Get('order')
  public async getOrder(@Query() query: IRealDataQuery) {
    return await this.realDataService.getOrder(query);
  }

  @Post('order')
  @ApiBody(REAL_DATA_API_BODY.order)
  public async insertOrder(@Body('id') body: string) {
    return await this.realDataService.insertOrder(body);
  }

  @Put('order')
  @ApiBody(REAL_DATA_API_BODY.order)
  public async toggleOrderStatus(@Body('id') body: string) {
    return await this.realDataService.toggleOrderStatus(body);
  }

  @Delete('order')
  @ApiBody(REAL_DATA_API_BODY.deleteOrder)
  public async deleteOrder(@Body() body: string[]) {
    return await this.realDataService.deleteOrder(body);
  }

  @Get('order/content')
  public async getOrderContent(@Query() query: IRealDataOrderContentQuery) {
    if (query.stockId === undefined)
      throw new BadRequestException('Missing stockId');

    query.order = {
      order: 'ASC',
      orderBy: 'createdTime',
    };
    return await this.realDataService.getOrderContent(query);
  }

  @Post('order/content')
  @ApiBody(REAL_DATA_CONTENT_API_BODY.order)
  public async insertOrderContent(@Body() body: IRealDataOrderContentInsert) {
    return await this.realDataService.insertOrderContent(body);
  }

  @Get('display')
  public async getDisplay(@Query() query: IRealDataQuery) {
    return await this.realDataService.getOrder(query);
  }

  @Post('display')
  @ApiBody(REAL_DATA_API_BODY.display)
  public async insertDisplay(@Body('id') body: string) {
    return await this.realDataService.insertDisplay(body);
  }

  @Put('display')
  @ApiBody(REAL_DATA_API_BODY.display)
  public async toggleDisplayStatus(@Body('id') body: string) {
    return await this.realDataService.toggleDisplayStatus(body);
  }

  @Delete('display')
  @ApiBody(REAL_DATA_API_BODY.deleteDisplay)
  public async deleteDisplay(@Body() body: string[]) {
    return await this.realDataService.deleteDisplay(body);
  }

  @Get('display/content')
  @ApiResponse({ status: 200, schema: IRealDataObjectResponse })
  public async getDisplayContent(@Query() query: IRealDataDisplayContentQuery) {
    return await this.realDataService.getDisplayContent(query);
  }

  @Get('display/download')
  public async downloadDisplayContent(
    @Query() query: IRealDataDisplayContentQuery,
    @Res() res: Response,
  ) {
    const displayContent = await this.realDataService.getDisplayContent(query);

    const path = await this.realDataService.getFilePath(query);
    this.realDataService.createFile(path, displayContent);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.download(path, () => {
      this.realDataService.removeFile(path);
      res.end();
    });
  }

  @Post('display/content')
  @ApiBody(REAL_DATA_CONTENT_API_BODY.display)
  public async insertDisplayContent(
    @Body() body: IRealDataDisplayContentInsert,
  ) {
    return await this.realDataService.insertDisplayContent(body);
  }
}

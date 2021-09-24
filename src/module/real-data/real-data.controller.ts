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
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import {
  MethodEnum,
  PriceTypeEnum,
  SubMethodEnum,
  TimeRestrictiomEnum,
} from 'src/common/enum';
import {
  IRealDataDisplayContentQuery,
  IRealDataObjectResponse,
  IRealDataOrderContentQuery,
  IRealDataQuery,
  REAL_DATA_API_BODY,
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
    try {
      const result = await this.realDataService.insertOrder(body);
      return result;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
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
  @ApiBody(REAL_DATA_API_BODY.orderContent)
  @ApiQuery({
    name: 'id',
    example: 'odr20191202',
  })
  public async insertOrderContent(
    @Body() body: string[],
    @Query('id') id: string,
  ) {
    if (id === undefined) throw new BadRequestException('Missing id');
    const insertBody = body.map((rowData) => {
      const investorId = null;

      const year = rowData.slice(0, 4);
      const month = rowData.slice(4, 6);
      const day = rowData.slice(6, 8);

      const hour = rowData.slice(16, 18);
      const min = rowData.slice(18, 20);
      const sec = rowData.slice(20, 22);
      const mis = rowData.slice(22, 24);

      const createdTime = new Date(
        `${year} ${month} ${day} ${hour}:${min}:${sec}:${mis}`,
      );

      const stockId = rowData.slice(8, 14);

      const method =
        rowData.slice(14, 15) === 'B' ? MethodEnum.BUY : MethodEnum.SELL;

      let subMethod = rowData.slice(29, 30) as any;
      switch (+subMethod) {
        case 1:
        case 4:
          subMethod = null;
          break;

        case 3:
        case 6:
          subMethod = SubMethodEnum.CANCEL;
          break;

        default:
          subMethod = SubMethodEnum.UPDATE;
          break;
      }

      const price = +rowData.slice(30, 37);
      const quantity = +rowData.slice(38, 48);
      const priceType =
        rowData.slice(50, 51) === '1'
          ? PriceTypeEnum.MARKET
          : PriceTypeEnum.LIMIT;

      let timeRestriction = rowData.slice(51, 52) as any;
      switch (+timeRestriction) {
        case 3:
          timeRestriction = TimeRestrictiomEnum.IOC;
          break;
        case 4:
          timeRestriction = TimeRestrictiomEnum.FOK;
          break;
        default:
          timeRestriction = TimeRestrictiomEnum.ROD;
          break;
      }

      const result = {
        investorId,
        stockId,
        method,
        subMethod,
        price,
        quantity,
        priceType,
        timeRestriction,
        createdTime,
        realDataOrderId: id,
      };
      return result;
    });
    try {
      return await this.realDataService.insertOrderContent(insertBody);
    } catch {
      await this.realDataService.deleteOrder([id]);
      throw new BadRequestException('Text type error');
    }
  }

  @Get('display')
  public async getDisplay(@Query() query: IRealDataQuery) {
    return await this.realDataService.getDisplay(query);
  }

  @Post('display')
  @ApiBody(REAL_DATA_API_BODY.display)
  public async insertDisplay(@Body('id') body: string) {
    try {
      const result = await this.realDataService.insertDisplay(body);
      return result;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
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
  @ApiBody(REAL_DATA_API_BODY.displayContent)
  @ApiQuery({
    name: 'id',
    example: 'dsp20191202',
  })
  public async insertDisplayContent(
    @Body() body: string[],
    @Query('id') id: string,
  ) {
    if (id === undefined)
      throw new BadRequestException('Missing realDataDisplayId');
    const insertBody = body.map((rowData) => {
      const result = {} as any;
      result.sym = rowData.slice(0, 6);

      const year = rowData.slice(176, 180);
      const month = rowData.slice(180, 182);
      const day = rowData.slice(182, 184);

      const hour = rowData.slice(6, 8);
      const min = rowData.slice(8, 10);
      const sec = rowData.slice(10, 12);
      const mis = rowData.slice(12, 14);

      result.createdTime = new Date(
        `${year} ${month} ${day} ${hour}:${min}:${sec}:${mis}`,
      );

      result.mthpx = +rowData.slice(18, 24);
      result.mthsz = +rowData.slice(24, 32);
      result.bsz = +rowData.slice(32, 33);
      const B_BASE = 34;
      for (let i = 0; i < 5; i++) {
        const tempBase = B_BASE + i * 14;
        result[`b${i + 1}px`] = +rowData.slice(tempBase, tempBase + 6);
        result[`b${i + 1}sz`] = +rowData.slice(tempBase + 6, tempBase + 14);
      }

      result.asz = +rowData.slice(104, 105);
      const A_BASE = 106;
      for (let i = 0; i < 5; i++) {
        const tempBase = A_BASE + i * 14;
        result[`a${i + 1}px`] = +rowData.slice(tempBase, tempBase + 6);
        result[`a${i + 1}sz`] = +rowData.slice(tempBase + 6, tempBase + 14);
      }

      result.realDataDisplayId = id;
      return result;
    });

    try {
      return await this.realDataService.insertDisplayContent(insertBody);
    } catch {
      await this.realDataService.deleteDisplay([id]);
      throw new BadRequestException('Text type error');
    }
  }
}

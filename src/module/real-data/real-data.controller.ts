import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import {
  MethodEnum,
  PriceTypeEnum,
  SubMethodEnum,
  TimeRestrictiomEnum,
} from 'src/common/enum';
import {
  IRealDataDisplayContentInsert,
  IRealDataCommonContentQuery,
  IRealDataObjectResponse,
  IRealDataOrderContentInsert,
  IRealDataQuery,
  IRealDataTransactionContentInsert,
  REAL_DATA_API_BODY,
} from './real-data-dto';
import { RealDataService } from './real-data.service';
import * as moment from 'moment';

const transferPriceToPoint = (str: string) => {
  const lastTwoChar = str.slice(-2);
  return `${str.split(lastTwoChar)[0]}.${lastTwoChar}`;
};
@ApiTags('RealData')
@ApiSecurity('login')
@Controller('real-data')
export class RealDataController {
  constructor(private readonly realDataService: RealDataService) {}

  @Get('available-stock')
  public async getAvailableStock() {
    return this.realDataService.getAvailableStock();
  }

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
  public async getOrderContent(
    @Query()
    query: any,
    @Res()
    res: Response,
  ) {
    if (query.isSimulatedOrder) {
      if (query.stockId === undefined)
        throw new BadRequestException('Missing stockId');

      query.order = {
        order: 'ASC',
        orderBy: 'createdTime',
      };
      res.json(await this.realDataService.getSimulatedOrderContent(query));
    } else {
      res.setHeader('Access-Control-Expose-Headers', 'filename');
      res.setHeader('filename', this.getFilename(query, 'odr'));
      res.json(await this.realDataService.getOrderContent(query));
    }
  }

  private parseFutureOrder(
    rows: string[],
    id: string,
  ): IRealDataOrderContentInsert[] {
    return rows.map((row) => {
      const result = {} as IRealDataOrderContentInsert;
      const array = row.split('\t');

      const date = array[0]; //20190102
      const time = array[9]; //13:39:55.837000
      const year = date.slice(0, 4);
      const month = date.slice(4, 6);
      const day = date.slice(6, 8);

      const hour = time.slice(0, 2);
      const min = time.slice(3, 5);
      const sec = time.slice(6, 8);
      const mis = time.slice(9, 12);

      result.createdTime = new Date(
        `${year} ${month} ${day} ${hour}:${min}:${sec}:${mis}`,
      );
      result.realDataOrderId = id;
      result.stockId = array[1];
      result.method = array[2] === 'B' ? MethodEnum.BUY : MethodEnum.SELL;
      result.quantity = +array[3];
      result.price = +array[5];
      result.priceType =
        array[6] === 'L' ? PriceTypeEnum.LIMIT : PriceTypeEnum.MARKET;
      switch (array[7]) {
        case 'I': {
          result.timeRestriction = TimeRestrictiomEnum.IOC;
          break;
        }
        case 'F': {
          result.timeRestriction = TimeRestrictiomEnum.FOK;
          break;
        }
        default: {
          result.timeRestriction = TimeRestrictiomEnum.ROD;
          break;
        }
      }
      result.code = array[12];

      // TODO subMethod
      return result;
    });
  }

  private parseStockOrder(
    rows: string[],
    id: string,
  ): IRealDataOrderContentInsert[] {
    return rows.map((row) => {
      const year = row.slice(0, 4);
      const month = row.slice(4, 6);
      const day = row.slice(6, 8);

      const hour = row.slice(16, 18);
      const min = row.slice(18, 20);
      const sec = row.slice(20, 22);
      const mis = row.slice(22, 24);

      const createdTime = new Date(
        `${year} ${month} ${day} ${hour}:${min}:${sec}:${mis}`,
      );

      const stockId = row.slice(8, 14);

      const method =
        row.slice(14, 15) === 'B' ? MethodEnum.BUY : MethodEnum.SELL;

      const code = row.slice(24, 29);
      let subMethod = row.slice(29, 30) as any;
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

      const price = +row.slice(30, 37);
      const quantity = +row.slice(38, 48);
      const priceType =
        row.slice(50, 51) === '1' ? PriceTypeEnum.MARKET : PriceTypeEnum.LIMIT;

      let timeRestriction = row.slice(51, 52) as any;
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
        stockId,
        method,
        subMethod,
        price,
        quantity,
        priceType,
        timeRestriction,
        createdTime,
        realDataOrderId: id,
        code,
      };
      return result;
    });
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
    const insertBody = id.startsWith('odr')
      ? this.parseStockOrder(body, id)
      : this.parseFutureOrder(body, id);
    try {
      return await this.realDataService.insertOrderContent(insertBody);
    } catch (e) {
      await this.realDataService.deleteOrder([id]);
      throw new BadRequestException(e.message || 'Text type error');
    }
  }

  @Get('order/available/:stockId')
  public async getAvailableOrderDate(@Param('stockId') stockId: string) {
    return await this.realDataService.getAvailableOrderDate(stockId);
  }

  @Get('transaction')
  public async getTransaction(@Query() query: IRealDataQuery) {
    return await this.realDataService.getTransaction(query);
  }

  @Post('transaction')
  public async insertTransaction(@Body('id') body: string) {
    try {
      const result = await this.realDataService.insertTransaction(body);
      return result;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put('transaction')
  public async toggleTransactionStatus(@Body('id') body: string) {
    return await this.realDataService.toggleTransactionStatus(body);
  }

  @Delete('transaction')
  public async deleteTransaction(@Body() body: string[]) {
    return await this.realDataService.deleteTransaction(body);
  }

  @Get('transaction/content')
  public async getTransactionContent(
    @Query() query: IRealDataCommonContentQuery,
    @Res() res: Response,
  ) {
    res.setHeader('Access-Control-Expose-Headers', 'filename');
    res.setHeader('filename', this.getFilename(query, 'mth'));
    res.json(await this.realDataService.getTransactionContent(query));
  }

  private parseStockTransaction(
    rows: string[],
    id: string,
  ): IRealDataTransactionContentInsert[] {
    return rows.map((row) => {
      const result = {} as IRealDataTransactionContentInsert;

      const date = row.slice(0, 8);
      const time = row.slice(16, 24);

      const year = date.slice(0, 4);
      const month = date.slice(4, 6);
      const day = date.slice(6, 8);

      const hour = time.slice(0, 2);
      const min = time.slice(2, 4);
      const sec = time.slice(4, 6);
      const mis = time.slice(6, 8);

      result.stockId = row.slice(8, 14);
      result.price = +row.slice(37, 44);
      result.quantity = +row.slice(44, 53);
      result.createdTime = new Date(
        `${year} ${month} ${day} ${hour}:${min}:${sec}:${mis}`,
      );

      result.realDataTransactionId = id;
      result.code = row.slice(32, 37);

      return result;
    });
  }

  private parseFutureTransaction(
    rows: string[],
    id: string,
  ): IRealDataTransactionContentInsert[] {
    return rows.map((row) => {
      const result = {} as IRealDataTransactionContentInsert;
      const array = row.split('\t');

      const date = array[0];
      const time = array[15];

      const year = date.slice(0, 4);
      const month = date.slice(4, 6);
      const day = date.slice(6, 8);

      const hour = time.slice(0, 2);
      const min = time.slice(3, 5);
      const sec = time.slice(6, 8);
      const mis = time.slice(9, 12);

      result.stockId = array[1];
      result.price = +array[11];
      result.quantity = +array[12];
      result.createdTime = new Date(
        `${year} ${month} ${day} ${hour}:${min}:${sec}:${mis}`,
      );

      result.realDataTransactionId = id;
      result.code = array[18];

      return result;
    });
  }

  @Post('transaction/content')
  public async insertTransactionContent(
    @Body() body: string[],
    @Query('id') id: string,
  ) {
    if (id === undefined)
      throw new BadRequestException('Missing realDataTransactionId');
    const insertBody = id.startsWith('mth')
      ? this.parseStockTransaction(body, id)
      : this.parseFutureTransaction(body, id);

    try {
      return await this.realDataService.insertTransactionContent(insertBody);
    } catch (e) {
      await this.realDataService.deleteTransaction([id]);
      throw new BadRequestException(e.message || 'Text type error');
    }
  }

  @Get('transaction/available/:stockId')
  public async getAvailableTransactionDate(@Param('stockId') stockId: string) {
    return await this.realDataService.getAvailableTransactionDate(stockId);
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

  private getFilename(
    query: IRealDataCommonContentQuery,
    fileType: 'odr' | 'mth' | 'dsp',
  ) {
    const min =
      query.createdTime && query.createdTime.min
        ? moment(query.createdTime.min).format('YYYYMMDD') +
          moment(query.createdTime.min).format('HHmmss')
        : 'x';
    const max =
      query.createdTime && query.createdTime.max
        ? moment(query.createdTime.max).format('YYYYMMDD') +
          moment(query.createdTime.max).format('HHmmss')
        : 'x';

    const mode =
      query.dateFormat !== undefined
        ? `${query.dateFormat}${
            query.sampleMode !== undefined ? query.sampleMode : 'x'
          }`
        : 'xx';

    const timeStamp = new Date().getTime();

    const fileName = `${fileType}_${query.stockId}_${min}_${max}_${mode}_${timeStamp}.csv`;

    return fileName;
  }

  @Get('display/content')
  @ApiResponse({ status: 200, schema: IRealDataObjectResponse })
  public async getDisplayContent(
    @Query() query: IRealDataCommonContentQuery,
    @Res() res: Response,
  ) {
    res.setHeader('Access-Control-Expose-Headers', 'filename');
    res.setHeader('filename', this.getFilename(query, 'dsp'));
    res.json(await this.realDataService.getDisplayContent(query));
  }

  @Get('display/download')
  public async downloadDisplayContent(
    @Query() query: IRealDataCommonContentQuery,
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

  private parseFutureDisplay(
    rows: string[],
    id: string,
  ): IRealDataDisplayContentInsert[] {
    return rows.map((row) => {
      const result = {} as IRealDataDisplayContentInsert;
      const array = row.split('\t');

      const date = array[0];
      const time = array[2].padStart(12, '0');

      const year = date.slice(0, 4);
      const month = date.slice(4, 6);
      const day = date.slice(6, 8);

      const hour = time.slice(0, 2);
      const min = time.slice(2, 4);
      const sec = time.slice(4, 6);
      const mis = time.slice(6, 9);

      result.sym = array[1];
      result.createdTime = new Date(
        `${year} ${month} ${day} ${hour}:${min}:${sec}:${mis}`,
      );

      for (let i = 0; i < 5; i++) {
        result[`b${i + 1}px`] = +array[3 + 2 * i];
        result[`b${i + 1}sz`] = +array[4 + 2 * i];

        result[`a${i + 1}px`] = +array[13 + 2 * i];
        result[`a${i + 1}sz`] = +array[14 + 2 * i];
      }

      result.bsz = +array[24];
      result.asz = +array[26];
      result.realDataDisplayId = id;
      return result;
    });
  }

  private parseStockDisplay(
    rows: string[],
    id: string,
  ): IRealDataDisplayContentInsert[] {
    return rows.map((row) => {
      const result = {} as IRealDataDisplayContentInsert;
      result.sym = row.slice(0, 6);

      const year = row.slice(176, 180);
      const month = row.slice(180, 182);
      const day = row.slice(182, 184);

      const hour = row.slice(6, 8);
      const min = row.slice(8, 10);
      const sec = row.slice(10, 12);
      const mis = row.slice(12, 14);

      result.createdTime = new Date(
        `${year} ${month} ${day} ${hour}:${min}:${sec}:${mis}`,
      );

      result.mthpx = +row.slice(18, 24);
      result.mthsz = +row.slice(24, 32);
      result.bsz = +row.slice(32, 33);
      const B_BASE = 34;
      for (let i = 0; i < 5; i++) {
        const tempBase = B_BASE + i * 14;
        result[`b${i + 1}px`] = +transferPriceToPoint(
          row.slice(tempBase, tempBase + 6),
        );
        result[`b${i + 1}sz`] = +row.slice(tempBase + 6, tempBase + 14);
      }

      result.asz = +row.slice(104, 105);
      const A_BASE = 106;
      for (let i = 0; i < 5; i++) {
        const tempBase = A_BASE + i * 14;
        result[`a${i + 1}px`] = +transferPriceToPoint(
          row.slice(tempBase, tempBase + 6),
        );
        result[`a${i + 1}sz`] = +row.slice(tempBase + 6, tempBase + 14);
      }

      result.realDataDisplayId = id;
      return result;
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
    const insertBody = id.startsWith('dsp')
      ? this.parseStockDisplay(body, id)
      : this.parseFutureDisplay(body, id);

    try {
      return await this.realDataService.insertDisplayContent(insertBody);
    } catch (e) {
      await this.realDataService.deleteDisplay([id]);
      throw new BadRequestException(e.message || 'Text type error');
    }
  }

  @Get('display/available/:stockId')
  public async getAvailableDisplayDate(@Param('stockId') stockId: string) {
    return await this.realDataService.getAvailableDisplayDate(stockId);
  }
}

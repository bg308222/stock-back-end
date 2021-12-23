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
  IRealDataStockContentQuery,
  IRealDataObjectResponse,
  IRealDataOrderContentInsert,
  IRealDataQuery,
  IRealDataTransactionContentInsert,
  REAL_DATA_API_BODY,
} from './real-data-dto';
import { RealDataService } from './real-data.service';
import * as moment from 'moment';
import { InvestorService } from '../investor/investor.service';

const transferPriceToPoint = (str: string) => {
  const lastTwoChar = str.slice(-2);
  return `${str.split(lastTwoChar)[0]}.${lastTwoChar}`;
};
@ApiTags('RealData Stock')
@ApiSecurity('login')
@Controller('real-data/stock')
export class RealDataStockController {
  constructor(
    private readonly realDataService: RealDataService,
    private readonly investService: InvestorService,
  ) {}

  @Get('order')
  public async getOrder(@Query() query: IRealDataQuery) {
    return await this.realDataService.getRealData(query, 'order', 'stock');
  }

  @Post('order')
  @ApiBody(REAL_DATA_API_BODY.order)
  public async insertOrder(@Body('id') body: string) {
    try {
      const result = await this.realDataService.insertRealData(
        body,
        'order',
        'stock',
      );
      return result;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put('order')
  @ApiBody(REAL_DATA_API_BODY.order)
  public async toggleOrderStatus(@Body('id') body: string) {
    return await this.realDataService.toggleRealDataStatus(
      body,
      'order',
      'stock',
    );
  }

  @Delete('order')
  @ApiBody(REAL_DATA_API_BODY.deleteOrder)
  public async deleteOrder(@Body() body: string[]) {
    return await this.realDataService.deleteRealData(body, 'order', 'stock');
  }

  @Get('order/content')
  public async getOrderContent(
    @Query()
    query: IRealDataStockContentQuery,
    @Res()
    res: Response,
  ) {
    if ((query as any).isSimulatedOrder) {
      if (query.stockId === undefined)
        throw new BadRequestException('Missing stockId');

      (query as any).order = {
        order: 'ASC',
        orderBy: 'createdTime',
      };
      res.json(
        await this.realDataService.getSimulatedOrderContent(query, 'stock'),
      );
    } else {
      res.setHeader('Access-Control-Expose-Headers', 'filename');
      res.setHeader('filename', this.getFilename(query, 'odr'));
      const result = await this.realDataService.getOrderContent(query, 'stock');
      await this.investService.subRestApiTime(query.investor);
      res.json(result);
    }
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
        realDataOrder: { id },
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
    const insertBody = this.parseStockOrder(body, id);
    try {
      return await this.realDataService.insertRealDataContent(
        insertBody,
        'order',
        'stock',
      );
    } catch (e) {
      throw new BadRequestException(e.message || 'Text type error');
    }
  }

  @Get('transaction')
  public async getTransaction(@Query() query: IRealDataQuery) {
    return await this.realDataService.getRealData(
      query,
      'transaction',
      'stock',
    );
  }

  @Post('transaction')
  public async insertTransaction(@Body('id') body: string) {
    try {
      const result = await this.realDataService.insertRealData(
        body,
        'transaction',
        'stock',
      );
      return result;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put('transaction')
  public async toggleTransactionStatus(@Body('id') body: string) {
    return await this.realDataService.toggleRealDataStatus(
      body,
      'transaction',
      'stock',
    );
  }

  @Delete('transaction')
  public async deleteTransaction(@Body() body: string[]) {
    return await this.realDataService.deleteRealData(
      body,
      'transaction',
      'stock',
    );
  }

  @Get('transaction/content')
  public async getTransactionContent(
    @Query() query: IRealDataStockContentQuery,
    @Res() res: Response,
  ) {
    res.setHeader('Access-Control-Expose-Headers', 'filename');
    res.setHeader('filename', this.getFilename(query, 'mth'));
    const result = await this.realDataService.getTransactionContent(
      query,
      'stock',
    );
    await this.investService.subRestApiTime(query.investor);
    res.json(result);
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

      result.realDataTransaction = { id };
      result.code = row.slice(32, 37);

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
    const insertBody = this.parseStockTransaction(body, id);

    try {
      return await this.realDataService.insertRealDataContent(
        insertBody,
        'transaction',
        'stock',
      );
    } catch (e) {
      throw new BadRequestException(e.message || 'Text type error');
    }
  }

  @Get('display')
  public async getDisplay(@Query() query: IRealDataQuery) {
    return await this.realDataService.getRealData(query, 'display', 'stock');
  }

  @Post('display')
  @ApiBody(REAL_DATA_API_BODY.display)
  public async insertDisplay(@Body('id') body: string) {
    try {
      const result = await this.realDataService.insertRealData(
        body,
        'display',
        'stock',
      );
      return result;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put('display')
  @ApiBody(REAL_DATA_API_BODY.display)
  public async toggleDisplayStatus(@Body('id') body: string) {
    return await this.realDataService.toggleRealDataStatus(
      body,
      'display',
      'stock',
    );
  }

  @Delete('display')
  @ApiBody(REAL_DATA_API_BODY.deleteDisplay)
  public async deleteDisplay(@Body() body: string[]) {
    return await this.realDataService.deleteRealData(body, 'display', 'stock');
  }

  private getFilename(
    query: IRealDataStockContentQuery,
    fileType: 'odr' | 'mth' | 'dsp',
  ) {
    const min = query.startTime
      ? moment(query.startTime).format('YYYYMMDD') +
        moment(query.startTime).format('HHmmss')
      : 'x';
    const max = query.endTime
      ? moment(query.endTime).format('YYYYMMDD') +
        moment(query.endTime).format('HHmmss')
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
    @Query() query: IRealDataStockContentQuery,
    @Res() res: Response,
  ) {
    res.setHeader('Access-Control-Expose-Headers', 'filename');
    res.setHeader('filename', this.getFilename(query, 'dsp'));
    const result = await this.realDataService.getDisplayContent(query, 'stock');
    await this.investService.subRestApiTime(query.investor);
    res.json(result);
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

      result.realDataDisplay = { id };
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
    const insertBody = this.parseStockDisplay(body, id);

    try {
      return await this.realDataService.insertRealDataContent(
        insertBody,
        'display',
        'stock',
      );
    } catch (e) {
      throw new BadRequestException(e.message || 'Text type error');
    }
  }
}

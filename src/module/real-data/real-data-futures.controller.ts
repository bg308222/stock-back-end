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
  TimeRestrictiomEnum,
} from 'src/common/enum';
import {
  IRealDataDisplayContentInsert,
  IRealDataFuturesContentQuery,
  IRealDataObjectResponse,
  IRealDataOrderContentInsert,
  IRealDataQuery,
  IRealDataTransactionContentInsert,
  REAL_DATA_API_BODY,
} from './real-data-dto';
import { RealDataService } from './real-data.service';
import * as moment from 'moment';
import { InvestorService } from '../investor/investor.service';

@ApiTags('RealData Futures')
@ApiSecurity('login')
@Controller('real-data/futures')
export class RealDataFuturesController {
  constructor(
    private readonly realDataService: RealDataService,
    private readonly investService: InvestorService,
  ) {}

  @Get('order')
  public async getOrder(@Query() query: IRealDataQuery) {
    return await this.realDataService.getRealData(query, 'order', 'futures');
  }

  @Post('order')
  @ApiBody(REAL_DATA_API_BODY.order)
  public async insertOrder(@Body('id') body: string) {
    try {
      const result = await this.realDataService.insertRealData(
        body,
        'order',
        'futures',
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
      'futures',
    );
  }

  @Delete('order')
  @ApiBody(REAL_DATA_API_BODY.deleteOrder)
  public async deleteOrder(@Body() body: string[]) {
    return await this.realDataService.deleteRealData(body, 'order', 'futures');
  }

  @Get('order/content')
  public async getOrderContent(
    @Query()
    query: IRealDataFuturesContentQuery,
    @Res()
    res: Response,
  ) {
    if (query.futuresId === undefined)
      throw new BadRequestException('Missing futuresId');

    if ((query as any).isSimulatedOrder) {
      (query as any).order = {
        order: 'ASC',
        orderBy: 'createdTime',
      };
      res.json(
        await this.realDataService.getSimulatedOrderContent(
          { ...query, stockId: query.futuresId },
          'futures',
        ),
      );
    } else {
      res.setHeader('Access-Control-Expose-Headers', 'filename');
      res.setHeader('filename', this.getFilename(query, 'odr'));
      const result = await this.realDataService.getOrderContent(
        { ...query, stockId: query.futuresId },
        'futures',
      );
      await this.investService.subRestApiTime(query.investor);
      res.json(result);
    }
  }

  private parseFuturesOrder(
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
      result.realDataOrder = { id };
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
    const insertBody = this.parseFuturesOrder(body, id);
    try {
      return await this.realDataService.insertRealDataContent(
        insertBody,
        'order',
        'futures',
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
      'futures',
    );
  }

  @Post('transaction')
  public async insertTransaction(@Body('id') body: string) {
    try {
      const result = await this.realDataService.insertRealData(
        body,
        'transaction',
        'futures',
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
      'futures',
    );
  }

  @Delete('transaction')
  public async deleteTransaction(@Body() body: string[]) {
    return await this.realDataService.deleteRealData(
      body,
      'transaction',
      'futures',
    );
  }

  @Get('transaction/content')
  public async getTransactionContent(
    @Query() query: IRealDataFuturesContentQuery,
    @Res() res: Response,
  ) {
    res.setHeader('Access-Control-Expose-Headers', 'filename');
    res.setHeader('filename', this.getFilename(query, 'mth'));
    const result = await this.realDataService.getTransactionContent(
      { ...query, stockId: query.futuresId },
      'futures',
    );
    await this.investService.subRestApiTime(query.investor);
    res.json(result);
  }

  private parseFuturesTransaction(
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

      result.realDataTransaction = { id };
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
    const insertBody = this.parseFuturesTransaction(body, id);

    try {
      return await this.realDataService.insertRealDataContent(
        insertBody,
        'transaction',
        'futures',
      );
    } catch (e) {
      throw new BadRequestException(e.message || 'Text type error');
    }
  }

  @Get('display')
  public async getDisplay(@Query() query: IRealDataQuery) {
    return await this.realDataService.getRealData(query, 'display', 'futures');
  }

  @Post('display')
  @ApiBody(REAL_DATA_API_BODY.display)
  public async insertDisplay(@Body('id') body: string) {
    try {
      const result = await this.realDataService.insertRealData(
        body,
        'display',
        'futures',
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
      'futures',
    );
  }

  @Delete('display')
  @ApiBody(REAL_DATA_API_BODY.deleteDisplay)
  public async deleteDisplay(@Body() body: string[]) {
    return await this.realDataService.deleteRealData(
      body,
      'display',
      'futures',
    );
  }

  private getFilename(
    query: IRealDataFuturesContentQuery,
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

    const fileName = `${fileType}_${query.futuresId}_${min}_${max}_${mode}_${timeStamp}.csv`;

    return fileName;
  }

  @Get('display/content')
  @ApiResponse({ status: 200, schema: IRealDataObjectResponse })
  public async getDisplayContent(
    @Query() query: IRealDataFuturesContentQuery,
    @Res() res: Response,
  ) {
    res.setHeader('Access-Control-Expose-Headers', 'filename');
    res.setHeader('filename', this.getFilename(query, 'dsp'));
    const result = await this.realDataService.getDisplayContent(
      { ...query, stockId: query.futuresId },
      'futures',
    );
    await this.investService.subRestApiTime(query.investor);
    res.json(result);
  }

  private parseFuturesDisplay(
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
    const insertBody = this.parseFuturesDisplay(body, id);

    try {
      return await this.realDataService.insertRealDataContent(
        insertBody,
        'display',
        'futures',
      );
    } catch (e) {
      throw new BadRequestException(e.message || 'Text type error');
    }
  }
}

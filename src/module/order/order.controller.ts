import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  MethodEnum,
  OrderStatusEnum,
  PriceTypeEnum,
  SubMethodEnum,
  TimeRestrictiomEnum,
} from 'src/common/enum';
import { MatchService } from '../match/match.service';
import {
  IOrderDelete,
  IOrderInsert,
  IOrderQuery,
  IOrderQueryResponse,
} from './order.dto';
import { OrderService } from './order.service';
import * as fs from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Display } from 'src/common/entity/display.entity';
import { Repository } from 'typeorm';
import { Response } from 'express';
@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly matchService: MatchService,
    @InjectRepository(Display)
    private readonly displayRepository: Repository<Display>,
  ) {}

  @ApiResponse({ type: IOrderQueryResponse, status: 200 })
  @Get()
  public async get(@Query() query: IOrderQuery) {
    return await this.orderService.get(query);
  }

  @ApiResponse({ type: Number, status: 200 })
  @ApiOperation({
    summary: '發出委託',
    description:
      'investorId, stockId先傳1，等未來實作完stock跟investor再調成動態的',
  })
  @Post()
  public async insert(@Body() body: IOrderInsert) {
    if (body.investorId === undefined)
      throw new BadRequestException('Invalid investorId');
    //normal order
    const id = await this.orderService.insert(body);
    return await this.matchService.dispatchOrder({ ...body, id });
  }

  public async insertByRealData(@Body() body: string[]) {
    for (let i = 0; i < body.length; i++) {
      const rowData = body[i];
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

      const insertOrder: IOrderInsert = {
        investorId,
        stockId,
        method,
        subMethod,
        price,
        quantity,
        priceType,
        timeRestriction,
        createdTime,
        status: OrderStatusEnum.SUCCESS,
      };
      await this.orderService.insert(insertOrder);
      await this.matchService.dispatchOrder(insertOrder);
    }
    return true;
  }

  @Get('realData')
  public async getRealData() {
    const files = fs.readdirSync(process.env.REAL_DATA).filter((file) => {
      return file.startsWith('odr');
    });
    return files;
  }

  @Post('realData')
  public async postRealData(
    @Body() body: { stockId: string; fileName: string },
    @Res() res: Response,
  ) {
    const fileName = process.env.REAL_DATA + body.fileName;
    const _stockId = body.stockId.padEnd(6);
    const handleRequest = async (body: string[]) => {
      await this.insertByRealData(body);
    };
    await this.displayRepository.delete({ stockId: body.stockId });
    if (true) {
      let tempStr = '';
      const result = [];

      const readStream = fs.createReadStream(fileName);
      let findFlag = false;

      readStream.on('data', function (chunk) {
        const chunkStr = tempStr + chunk.toString();
        const strArr = chunkStr.split('\n');
        for (const str of strArr) {
          if (str.length !== 59) {
            tempStr = str;
          } else {
            const stockId = str.slice(8, 14);
            if (stockId === _stockId) {
              findFlag = true;
              result.push(str);
            } else {
              if (findFlag) {
                console.log(result.length);
                readStream.emit('end');
                readStream.close();
                break;
              }
            }
            tempStr = '';
          }
        }
      });

      readStream.on('end', async function () {
        console.time('RealData');
        let cnt = 0;
        while (result.length !== 0) {
          const data = result.splice(0, 1000);
          cnt += data.length;
          await handleRequest(data).then(() => {
            console.log(cnt);
          });
        }
        console.timeEnd('RealData');
        res.json(true);
      });
    }
  }

  @ApiOperation({
    summary: '取消委託',
  })
  @Delete()
  public async delete(@Body() body: IOrderDelete) {
    const order = await this.orderService.delete(body);
    const result = await this.matchService.dispatchOrder(order);
    if (result === false) this.orderService.updateStatusToFail(order.id);
    return result;
  }
}

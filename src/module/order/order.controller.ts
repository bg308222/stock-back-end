import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
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

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly matchService: MatchService,
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
    if (body.marketName) {
      //replay order
      const { marketName, ...order } = body;
      const display = await this.matchService.dispatchOrder(
        { ...order, id: 0 },
        marketName,
      );
      return display;
    } else {
      //normal order
      const order = await this.orderService.insert(body);
      return await this.matchService.dispatchOrder(order);
    }
  }

  @Post('realData')
  @ApiBody({
    schema: {
      type: 'string',
      example: [
        '201912020056  S009174642n58HF40027.71+0000450000010328J476M',
        '201912020056  S009174642n58HE40027.69+0000450000010328J476M',
      ],
    },
  })
  public async insertByRealData(@Body() body: string[]) {
    for (let i = 0; i < body.length; i++) {
      const rowData = body[i];
      const investorId = null;
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

      //TODO stock
      const insertOrder: IOrderInsert = {
        investorId,
        stockId: '1',
        method,
        subMethod,
        price,
        quantity,
        priceType,
        timeRestriction,
        status: OrderStatusEnum.SUCCESS,
      };
      const order = await this.orderService.insert(insertOrder);
      await this.matchService.dispatchOrder(order);
    }
    return true;
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

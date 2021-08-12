import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Order } from 'src/common/entity/order.entity';
import {
  MethodEnum,
  OrderStatusEnum,
  PriceTypeEnum,
  QueryStrategyEnum,
  SubMethodEnum,
  TimeRestrictiomEnum,
} from 'src/common/enum';
import {
  getEnumDescription,
  getRangeDescription,
  getResponseProperties,
} from 'src/common/helper/document.helper';
import { CommonQuery, IQueryStategy, IRange } from 'src/common/type';

export type IOrderSchema = Omit<Order, 'investor' | 'stock' | 'order'>;
export type IMatchOrder = Omit<IOrderSchema, 'createdTime' | 'orderId'>;

export class IOrderQuery extends PartialType(CommonQuery) {
  @ApiPropertyOptional()
  id?: number;

  @ApiPropertyOptional({ example: 1 })
  investorId?: number;

  @ApiPropertyOptional(getRangeDescription(false))
  createdTime?: IRange<string>;

  @ApiPropertyOptional({ example: 1 })
  stockId?: number;

  @ApiPropertyOptional(getEnumDescription('method'))
  method?: MethodEnum[];

  @ApiPropertyOptional(getEnumDescription('subMethod'))
  subMethod?: SubMethodEnum[];

  @ApiPropertyOptional(getRangeDescription())
  price?: IRange<number>;

  @ApiPropertyOptional(getRangeDescription())
  quantity?: IRange<number>;

  @ApiPropertyOptional(getEnumDescription('priceType'))
  priceType?: PriceTypeEnum[];

  @ApiPropertyOptional(getEnumDescription('timeRestriction'))
  timeRestriction?: TimeRestrictiomEnum[];

  @ApiPropertyOptional(getEnumDescription('orderStatus'))
  status?: OrderStatusEnum[];
}

export const queryStrategy: IQueryStategy<IOrderQuery> = {
  id: QueryStrategyEnum.value,
  investorId: QueryStrategyEnum.value,
  createdTime: QueryStrategyEnum.range,
  stockId: QueryStrategyEnum.value,
  method: QueryStrategyEnum.inArray,
  subMethod: QueryStrategyEnum.inArray,
  price: QueryStrategyEnum.range,
  quantity: QueryStrategyEnum.range,
  priceType: QueryStrategyEnum.inArray,
  timeRestriction: QueryStrategyEnum.inArray,
  status: QueryStrategyEnum.inArray,
};

export class IOrderQueryResponse {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: getResponseProperties<IOrderSchema>([
        { key: 'id', type: 'number' },
        { key: 'investorId', type: 'number' },
        { key: 'createdTime', type: 'date' },
        { key: 'stockId', type: 'number' },
        { key: 'method', type: 'number' },
        { key: 'subMethod', type: 'number' },
        { key: 'price', type: 'number' },
        { key: 'quantity', type: 'number' },
        { key: 'priceType', type: 'number' },
        { key: 'timeRestriction', type: 'number' },
        { key: 'status', type: 'number' },
      ]),
    },
  })
  content: Record<string, any>;

  @ApiProperty({ example: 10 })
  totalSize: number;
}

export class IOrderInsert {
  @ApiProperty({ example: 1 })
  investorId: number;

  @ApiProperty({ example: 1 })
  stockId: number;

  @ApiProperty(getEnumDescription('method', false))
  method: MethodEnum;

  @ApiProperty(getEnumDescription('subMethod', false))
  subMethod: SubMethodEnum;

  @ApiProperty()
  price: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty(getEnumDescription('priceType', false))
  priceType: PriceTypeEnum;

  @ApiProperty(getEnumDescription('timeRestriction', false))
  timeRestriction: TimeRestrictiomEnum;

  @ApiProperty(getEnumDescription('orderStatus', false))
  status: OrderStatusEnum;
}

export class IOrderDelete {
  @ApiProperty()
  id: number;

  @ApiProperty()
  quantity: number;
}

export class IReplayOrderInsert {
  @ApiProperty({ example: 1 })
  investorId: number;

  @ApiProperty({ example: 1 })
  stockId: number;

  @ApiProperty(getEnumDescription('method', false))
  method: MethodEnum;

  @ApiProperty(getEnumDescription('subMethod', false))
  subMethod: SubMethodEnum;

  @ApiProperty()
  price: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty(getEnumDescription('priceType', false))
  priceType: PriceTypeEnum;

  @ApiProperty(getEnumDescription('timeRestriction', false))
  timeRestriction: TimeRestrictiomEnum;

  @ApiProperty(getEnumDescription('orderStatus', false))
  status: OrderStatusEnum;

  @ApiProperty()
  marketName: string;
}

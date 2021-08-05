import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  MethodEnum,
  PriceTypeEnum,
  QueryStrategyEnum,
  TimeRestrictiomEnum,
} from 'src/common/enum';
import {
  getEnumDescription,
  getPageDescription,
  getRangeDescription,
  getResponseProperties,
} from 'src/common/helper/document.helper';
import { IPage, IQueryStategy, IRange } from 'src/common/type';

export interface IOrderSchema {
  id: number;
  investorId: number;
  createdTime: string;
  stockId: number;
  method: number;
  price: number;
  quantity: number;
  priceType: number;
  timeRestriction: number;
  orderId: number;
}
export class IOrderQuery {
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

  @ApiPropertyOptional(getRangeDescription())
  price?: IRange<number>;

  @ApiPropertyOptional(getRangeDescription())
  quantity?: IRange<number>;

  @ApiPropertyOptional(getEnumDescription('priceType'))
  priceType?: PriceTypeEnum[];

  @ApiPropertyOptional(getEnumDescription('timeRestriction'))
  timeRestriction?: TimeRestrictiomEnum[];

  @ApiPropertyOptional()
  orderId?: number;

  @ApiPropertyOptional(getPageDescription())
  page?: IPage;
}

export const queryStrategy: IQueryStategy<IOrderQuery> = {
  id: QueryStrategyEnum.value,
  investorId: QueryStrategyEnum.value,
  createdTime: QueryStrategyEnum.range,
  stockId: QueryStrategyEnum.value,
  method: QueryStrategyEnum.inArray,
  price: QueryStrategyEnum.range,
  quantity: QueryStrategyEnum.range,
  priceType: QueryStrategyEnum.inArray,
  timeRestriction: QueryStrategyEnum.inArray,
  orderId: QueryStrategyEnum.value,
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
        { key: 'price', type: 'number' },
        { key: 'quantity', type: 'number' },
        { key: 'priceType', type: 'number' },
        { key: 'timeRestriction', type: 'number' },
        { key: 'orderId', type: 'number' },
      ]),
    },
  })
  content: Record<string, any>;

  @ApiProperty({ example: 10 })
  totalSize: number;
}

export class IOrderBody {
  @ApiProperty({ example: 1 })
  investorId: number;

  @ApiProperty({ example: 1 })
  stockId: number;

  @ApiProperty(getEnumDescription('method', false))
  method: MethodEnum;

  @ApiProperty()
  price: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty(getEnumDescription('priceType', false))
  priceType: PriceTypeEnum;

  @ApiProperty(getEnumDescription('timeRestriction', false))
  timeRestriction: TimeRestrictiomEnum;
}

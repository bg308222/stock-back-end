import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Stock } from 'src/common/entity/stock.entity';
import { QueryStrategyEnum } from 'src/common/enum';
import {
  getRangeDescription,
  getResponseProperties,
} from 'src/common/helper/document.helper';
import { CommonQuery, IQueryStategy, IRange } from 'src/common/type';
import { IOrderSchema } from '../order/order.dto';

export type IStockSchema = Stock;

export class IStockQuery extends PartialType(CommonQuery) {
  @ApiPropertyOptional()
  id?: number;

  @ApiPropertyOptional(getRangeDescription())
  closedPrice?: IRange<number>;

  @ApiPropertyOptional(getRangeDescription())
  priceLimit?: IRange<number>;

  @ApiPropertyOptional()
  virtualOrderContainerId?: number;

  @ApiPropertyOptional(getRangeDescription())
  currentPrice?: IRange<number>;

  @ApiPropertyOptional(getRangeDescription(false))
  createdTime?: IRange<string>;
}

export const queryStrategy: IQueryStategy<IStockQuery> = {
  id: QueryStrategyEnum.value,
  closedPrice: QueryStrategyEnum.range,
  priceLimit: QueryStrategyEnum.range,
  virtualOrderContainerId: QueryStrategyEnum.value,
  currentPrice: QueryStrategyEnum.range,
  createdTime: QueryStrategyEnum.range,
};

export class IStockQueryResponse {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: getResponseProperties<IStockSchema>([
        { key: 'id', type: 'number' },
        { key: 'closedPrice', type: 'number' },
        { key: 'virtualOrderContainerId', type: 'number' },
        { key: 'priceLimit', type: 'number' },
        { key: 'currentPrice', type: 'number' },
        { key: 'createdTime', type: 'number' },
        { key: 'updatedTime', type: 'number' },
      ]),
    },
  })
  content: Record<string, any>;

  @ApiProperty({ example: 10 })
  totalSize: number;
}

export class IStockUpdate {
  @ApiProperty({ required: true, example: 1, description: '要修改的股票id' })
  id?: number;

  @ApiProperty({ required: false, example: 1 })
  virtualOrderContainerId?: number;

  @ApiProperty({ required: false, example: 100 })
  closedPrice?: number;

  @ApiProperty({ required: false, example: 10 })
  priceLimit?: number;

  @ApiProperty({ required: false, example: 100 })
  currentPrice?: number;
}

export class IStockReset {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: false })
  isReset?: boolean;

  @ApiPropertyOptional({ example: '2021-08-07 16:43:43.763532' })
  createdTime?: string;
}

export class IStockResetResponse {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: getResponseProperties<IOrderSchema>([
        { key: 'investorId', type: 'number' },
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
  orders: IOrderSchema[];
}

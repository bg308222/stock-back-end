import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Stock } from 'src/common/entity/stock.entity';
import { QueryStrategyEnum } from 'src/common/enum';
import { getResponseProperties } from 'src/common/helper/document.helper';
import { CommonQuery, IQueryStategy } from 'src/common/type';
import { IOrderSchema } from '../order/order.dto';

export type IStockSchema = Stock;

export class IStockQuery extends PartialType(CommonQuery) {
  @ApiPropertyOptional()
  id?: number;
}

export const queryStrategy: IQueryStategy<IStockQuery> = {
  id: QueryStrategyEnum.value,
};

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

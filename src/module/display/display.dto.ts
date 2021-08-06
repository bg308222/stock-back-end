import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Display } from 'src/common/entity/display.entity';
import { QueryStrategyEnum } from 'src/common/enum';
import {
  getRangeDescription,
  getResponseProperties,
} from 'src/common/helper/document.helper';
import { CommonQuery, IQueryStategy, IRange } from 'src/common/type';

export type IDisplaySchema = Omit<Display, 'stock'>;
export interface ITickRange {
  price: number;
  buyQuantity: number;
  sellQuantity: number;
}
export class IDisplayQuery extends PartialType(CommonQuery) {
  @ApiPropertyOptional({ description: '設為true可只拿取最新一筆，預設為false' })
  isGetLatest?: boolean;

  @ApiPropertyOptional()
  id?: number;

  @ApiPropertyOptional(getRangeDescription(false))
  createdTime?: IRange<string>;

  @ApiPropertyOptional()
  stockId?: number;

  @ApiPropertyOptional(getRangeDescription())
  matchPrice?: IRange<number>;

  @ApiPropertyOptional(getRangeDescription())
  matchQuantity?: IRange<number>;
}

export const queryStrategy: IQueryStategy<Omit<IDisplayQuery, 'isGetLatest'>> =
  {
    id: QueryStrategyEnum.value,
    createdTime: QueryStrategyEnum.range,
    stockId: QueryStrategyEnum.value,
    matchPrice: QueryStrategyEnum.range,
    matchQuantity: QueryStrategyEnum.range,
  };

export class IDisplayQueryResponse {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: getResponseProperties<
        IDisplaySchema & {
          firstOrderBuyPrice: number;
          firstOrderSellPrice: number;
        }
      >([
        { key: 'id', type: 'number' },
        { key: 'createdTime', type: 'date' },
        { key: 'stockId', type: 'number' },
        { key: 'matchPrice', type: 'number' },
        { key: 'matchQuantity', type: 'number' },
        { key: 'firstOrderBuyPrice', type: 'number' },
        { key: 'firstOrderSellPrice', type: 'number' },
        {
          key: 'tickRange',
          type: 'numberArray',
          option: {
            example: [
              {
                price: 110,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 109,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 108,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 107,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 106,
                buyQuantity: 2,
                sellQuantity: 0,
              },
              {
                price: 105,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 104,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 103,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 102,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 101,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 100,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 99,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 98.5,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 98,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 97.5,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 97,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 96.5,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 96,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 95.5,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 95,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 94.5,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 94,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 93.5,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 93,
                buyQuantity: 1,
                sellQuantity: 0,
              },
              {
                price: 92.5,
                buyQuantity: 1,
                sellQuantity: 0,
              },
              {
                price: 92,
                buyQuantity: 1,
                sellQuantity: 0,
              },
              {
                price: 91.5,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 91,
                buyQuantity: 0,
                sellQuantity: 0,
              },
              {
                price: 90.5,
                buyQuantity: 0,
                sellQuantity: 0,
              },
            ],
          },
        },
      ]),
    },
  })
  content: Record<string, any>;

  @ApiProperty({ example: 10 })
  totalSize: number;
}

export class IDisplayInsert {
  @ApiProperty()
  stockId: number;

  @ApiProperty()
  matchPrice: number;

  @ApiProperty()
  matchQuantity: number;

  @ApiProperty()
  buyTick: string;

  @ApiProperty()
  sellTick: string;

  @ApiProperty()
  tickRange: string;
}

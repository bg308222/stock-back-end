import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Display } from 'src/common/entity/display.entity';
import { QueryStrategyEnum } from 'src/common/enum';
import {
  getRangeDescription,
  getResponseProperties,
} from 'src/common/helper/document.helper';
import { CommonQuery, IQueryStategy, IRange } from 'src/common/type';

export type IDisplaySchema = Omit<Display, 'stock'>;
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
          buyTickSize: number;
          buyUpperLowerLimit: number;
          firstOrderBuyPrice: number;
          sellTickSize: number;
          sellUpperLowerLimit: number;
          firstOrderSellPrice: number;
        }
      >([
        { key: 'id', type: 'number' },
        { key: 'createdTime', type: 'date' },
        { key: 'stockId', type: 'number' },
        { key: 'matchPrice', type: 'number' },
        { key: 'matchQuantity', type: 'number' },
        { key: 'buyTickSize', type: 'number' },
        { key: 'buyUpperLowerLimit', type: 'number' },
        { key: 'sellTickSize', type: 'number' },
        { key: 'sellUpperLowerLimit', type: 'number' },
        {
          key: 'buyFiveTick',
          type: 'numberArray',
          option: {
            example: [
              [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
              ],
            ],
          },
        },
        { key: 'firstOrderBuyPrice', type: 'number' },
        {
          key: 'sellFiveTick',
          type: 'numberArray',
          option: {
            example: [
              [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
              ],
            ],
          },
        },
        { key: 'firstOrderSellPrice', type: 'number' },
        {
          key: 'tickRange',
          type: 'numberArray',
          option: {
            example: [
              164, 163, 162, 161, 160, 159, 158, 157, 156, 155, 154, 153, 152,
              151, 150, 149, 148, 147, 146, 145, 144, 143, 142, 141, 140, 139,
              138, 137, 136,
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
  buyFiveTick: string;

  @ApiProperty()
  sellFiveTick: string;

  @ApiProperty()
  tickRange: string;
}

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { QueryStrategyEnum, UpperLowerLimitEnum } from 'src/common/enum';
import {
  getEnumDescription,
  getRangeDescription,
  getResponseProperties,
} from 'src/common/helper/document.helper';
import { CommonQuery, IQueryStategy, IRange } from 'src/common/type';

export class IDisplayQuery extends PartialType(CommonQuery) {
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

export const queryStrategy: IQueryStategy<IDisplayQuery> = {
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
      properties: getResponseProperties([
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
  buyTickSize: number;

  @ApiProperty(getEnumDescription('upperLowerLimit', false))
  buyUpperLowerLimit: UpperLowerLimitEnum;

  @ApiProperty()
  buyFiveTick: string;

  @ApiProperty()
  sellTickSize: number;

  @ApiProperty(getEnumDescription('upperLowerLimit', false))
  sellUpperLowerLimit: UpperLowerLimitEnum;

  @ApiProperty()
  sellFiveTick: string;

  @ApiProperty()
  tickRange: string;
}

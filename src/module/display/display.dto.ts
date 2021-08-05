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
        { key: 'buyFiveTick', type: 'json' },
        { key: 'sellTickSize', type: 'number' },
        { key: 'sellUpperLowerLimit', type: 'number' },
        { key: 'sellFiveTick', type: 'json' },
      ]),
    },
  })
  content: Record<string, any>;

  @ApiProperty({ example: 10 })
  totalSize: number;
}

export class IDisplayBody {
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
}

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { QueryStrategyEnum, UpperLowerLimitEnum } from 'src/common/enum';
import {
  getEnumDescription,
  getRangeDescription,
  getResponseProperties,
} from 'src/common/helper/document.helper';
import { CommonQuery, IQueryStategy, IRange } from 'src/common/type';

const tickExample = {
  '136': 2,
  '137': 2,
  '138': 1,
  '139': 1,
  '140': 0,
  '141': 2,
  '142': 0,
  '143': 1,
  '144': 1,
  '145': 1,
  '146': 1,
  '147': 0,
  '148': 0,
  '149': 0,
  '150': 1,
  '151': 0,
  '152': 0,
  '153': 0,
  '154': 0,
  '155': 1,
  '156': 1,
  '157': 1,
  '158': 1,
  '159': 0,
  '160': 0,
  '161': 0,
  '162': 0,
  '163': 0,
  '164': 0,
};

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
        { key: 'buyFiveTick', type: 'json', option: { example: tickExample } },
        { key: 'sellTickSize', type: 'number' },
        { key: 'sellUpperLowerLimit', type: 'number' },
        { key: 'sellFiveTick', type: 'json', option: { example: tickExample } },
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

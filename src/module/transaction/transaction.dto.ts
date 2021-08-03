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
} from 'src/common/helper/document.helper';
import { IPage, IQueryStategy, IRange } from 'src/common/type';

export class ITransactionQuery {
  @ApiPropertyOptional()
  id?: number;

  @ApiPropertyOptional()
  investorId?: number;

  @ApiPropertyOptional(getRangeDescription(false))
  createdTime?: IRange<string>;

  @ApiPropertyOptional()
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

  @ApiPropertyOptional(getPageDescription())
  page: IPage;
}

export class ITransactionQueryResponse {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          example: 1,
        },
        createdTime: {
          type: 'string',
          example: '2021-08-03T08:18:14.927Z',
        },
        updatedTime: {
          type: 'string',
          example: '2021-08-03T08:18:14.927Z',
        },
        method: {
          type: 'number',
          example: 0,
        },
        price: {
          type: 'number',
          example: 0,
        },
        quantity: {
          type: 'number',
          example: 0,
        },
        priceType: {
          type: 'number',
          example: 0,
        },
        timeRestriction: {
          type: 'number',
          example: 0,
        },
      },
    },
  })
  content: Record<string, any>;

  @ApiProperty({ example: 10 })
  totalSize: number;
}

export const queryStrategy: IQueryStategy<ITransactionQuery> = {
  id: QueryStrategyEnum.value,
  investorId: QueryStrategyEnum.value,
  createdTime: QueryStrategyEnum.range,
  stockId: QueryStrategyEnum.value,
  method: QueryStrategyEnum.inArray,
  price: QueryStrategyEnum.range,
  quantity: QueryStrategyEnum.range,
  priceType: QueryStrategyEnum.inArray,
  timeRestriction: QueryStrategyEnum.inArray,
};

//TODO insert transaction
export class ITransactionBody {
  @ApiProperty({
    example: 1,
  })
  investorId: number;

  @ApiProperty({
    example: 1,
  })
  stockId: number;

  @ApiProperty(getEnumDescription('method', false))
  method: MethodEnum;

  @ApiProperty()
  price: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty(getEnumDescription('method', false))
  priceType: PriceTypeEnum;

  @ApiProperty(getEnumDescription('method', false))
  timeRestriction: TimeRestrictiomEnum;
}

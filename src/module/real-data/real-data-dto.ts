import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { RealDataDisplayContent } from 'src/common/entity/realDataDisplayContent.entity';
import { RealDataOrderContent } from 'src/common/entity/realDataOrderContent.entity';
import {
  DateFormatEnum,
  QueryStrategyEnum,
  SampleModeEnum,
} from 'src/common/enum';
import {
  getEnumDescription,
  getRangeDescription,
  getResponseProperties,
} from 'src/common/helper/document.helper';
import { CommonQuery, IQueryStategy, IRange } from 'src/common/type';

export type IRealDataOrderContentInsert = Omit<
  RealDataOrderContent,
  'id' | 'realDataOrder'
>[];
export type IRealDataDisplayContentInsert = Omit<
  RealDataDisplayContent,
  'id' | 'realDataDisplay'
>[];

export type IRealDataDisplayContentSchema = Omit<
  RealDataDisplayContent,
  'realDataDisplay' | 'realDataDisplayId' | 'createdTime'
> & { createdTime: string };

export const REAL_DATA_API_BODY = {
  order: {
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: 'odr20191202',
        },
      },
    },
  },
  deleteOrder: {
    schema: {
      type: 'array',
      items: {
        type: 'string',
        example: 'odr20191202',
      },
    },
  },
  orderContent: {
    schema: {
      type: 'array',
      items: {
        type: 'string',
        example: '2019120600656RB009231383Y849910010.82+00000100000 0128J765M',
      },
    },
  },
  display: {
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: 'dsp20191202',
        },
      },
    },
  },
  deleteDisplay: {
    schema: {
      type: 'array',
      items: {
        type: 'string',
        example: 'dsp20191202',
      },
    },
  },
  displayContent: {
    schema: {
      type: 'array',
      items: {
        type: 'string',
        example:
          '0056  10513243  Y 002758000144355 00275700000032002756000002420027550000082200275400000210002753000002025 002758000000310027590000281200276000003849002761000034010027620000290620191202AA',
      },
    },
  },
};

export const REAL_DATA_CONTENT_API_BODY = {
  order: {
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          createdTime: {
            type: 'string',
            example: '2021-09-16T06:30:37.832Z',
          },
          stockId: {
            type: 'string',
            example: '0050  ',
          },
          method: { type: 'number' },
          subMethod: { type: 'number' },
          price: { type: 'number' },
          quantity: { type: 'number' },
          priceType: { type: 'number' },
          timeRestriction: { type: 'number' },
          realDataOrderId: { type: 'string', example: 'odr20191202' },
        },
      },
    },
  },
  display: {
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sym: {
            type: 'string',
            example: '0050  ',
          },
          createdTime: {
            type: 'string',
            example: '2021-09-16T06:52:10.353Z',
          },
          mthpx: { type: 'number' },
          mthsz: { type: 'number' },
          bsz: { type: 'number' },
          b1px: { type: 'number' },
          b1sz: { type: 'number' },
          b2px: { type: 'number' },
          b2sz: { type: 'number' },
          b3px: { type: 'number' },
          b3sz: { type: 'number' },
          b4px: { type: 'number' },
          b4sz: { type: 'number' },
          b5px: { type: 'number' },
          b5sz: { type: 'number' },
          asz: { type: 'number' },
          a1px: { type: 'number' },
          a1sz: { type: 'number' },
          a2px: { type: 'number' },
          a2sz: { type: 'number' },
          a3px: { type: 'number' },
          a3sz: { type: 'number' },
          a4px: { type: 'number' },
          a4sz: { type: 'number' },
          a5px: { type: 'number' },
          a5sz: { type: 'number' },
          realDataDisplayId: { type: 'string', example: 'dsp20191202' },
        },
      },
    },
  },
};

export class IRealDataQuery extends PartialType(CommonQuery) {
  @ApiPropertyOptional()
  id?: string;

  @ApiPropertyOptional({ isArray: true, enum: [0, 1] })
  isFinished?: number[];
}

export const realDataQueryStrategy: IQueryStategy<IRealDataQuery> = {
  id: QueryStrategyEnum.fuzzy,
  isFinished: QueryStrategyEnum.inArray,
};

export class IRealDataOrderContentQuery extends PartialType(CommonQuery) {
  @ApiProperty({ example: '0050  ' })
  stockId: string;

  @ApiPropertyOptional(getRangeDescription(false))
  createdTime?: IRange<string>;
}

export const realDataOrderContentQueryStrategy: IQueryStategy<IRealDataOrderContentQuery> =
  {
    stockId: QueryStrategyEnum.value,
    createdTime: QueryStrategyEnum.range,
  };

export class IRealDataDisplayContentQuery {
  @ApiPropertyOptional(getRangeDescription(false))
  createdTime?: IRange<string>;

  @ApiPropertyOptional({ default: 1 })
  unit?: number;

  @ApiPropertyOptional(getEnumDescription('dateFormat', false))
  dateFormat?: DateFormatEnum;

  @ApiPropertyOptional(getEnumDescription('sampleMode', false))
  sampleMode?: SampleModeEnum;

  @ApiPropertyOptional()
  fields?: string[];

  @ApiProperty({ required: true, example: '0050  ' })
  stockId: string;
}

export const IRealDataObjectResponse = {
  type: 'object',
  properties: getResponseProperties([
    {
      key: 'sym',
      type: 'string',
    },
    {
      key: 'trdate',
      type: 'string',
    },
    {
      key: 'ts',
      type: 'string',
    },
    {
      key: 'mthpx',
      type: 'number',
    },
    {
      key: 'mthsz',
      type: 'number',
    },
    {
      key: 'a1px',
      type: 'number',
    },
    {
      key: 'a1sz',
      type: 'number',
    },
    {
      key: 'a2px',
      type: 'number',
    },
    {
      key: 'a2sz',
      type: 'number',
    },
    {
      key: 'a3px',
      type: 'number',
    },
    {
      key: 'a3sz',
      type: 'number',
    },
    {
      key: 'a4px',
      type: 'number',
    },
    {
      key: 'a4sz',
      type: 'number',
    },
    {
      key: 'a5px',
      type: 'number',
    },
    {
      key: 'a5sz',
      type: 'number',
    },
    {
      key: 'b1px',
      type: 'number',
    },
    {
      key: 'b1sz',
      type: 'number',
    },
    {
      key: 'b2px',
      type: 'number',
    },
    {
      key: 'b2sz',
      type: 'number',
    },
    {
      key: 'b3px',
      type: 'number',
    },
    {
      key: 'b3sz',
      type: 'number',
    },
    {
      key: 'b4px',
      type: 'number',
    },
    {
      key: 'b4sz',
      type: 'number',
    },
    {
      key: 'b5px',
      type: 'number',
    },
    {
      key: 'b5sz',
      type: 'number',
    },
    {
      key: 'asz',
      type: 'number',
    },
    {
      key: 'bsz',
      type: 'number',
    },
  ]),
};

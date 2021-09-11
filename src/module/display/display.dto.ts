import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Display } from 'src/common/entity/display.entity';
import {
  DateFormatEnum,
  QueryStrategyEnum,
  StockTypeEnum,
  TrendFlagEnum,
} from 'src/common/enum';
import {
  getEnumDescription,
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

export interface ITransferDisplay {
  tickRange: ITickRange[];
  fiveTickRange: Partial<ITickRange>[];
  firstOrderBuyPrice: any;
  firstOrderSellPrice: any;
  stockId: string;
  matchPrice: number;
  matchQuantity: number;
  marketBuyQuantity: number;
  marketSellQuantity: number;
  trendFlag: number;
  stockType: number;
  createdTime?: string;
}
export class IDisplayQuery extends PartialType(CommonQuery) {
  @ApiPropertyOptional({ description: '設為true可只拿取最新一筆，預設為false' })
  isGetLatest?: boolean;

  @ApiPropertyOptional()
  id?: number;

  @ApiPropertyOptional(getRangeDescription(false))
  createdTime?: IRange<string>;

  @ApiPropertyOptional()
  stockId?: string;

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
          tickRange: ITickRange[];
          fiveTickRange: ITickRange[];
        }
      >([
        { key: 'id', type: 'number' },
        { key: 'createdTime', type: 'date' },
        { key: 'stockId', type: 'number' },
        { key: 'matchPrice', type: 'number' },
        { key: 'matchQuantity', type: 'number' },
        { key: 'marketBuyQuantity', type: 'number' },
        { key: 'marketSellQuantity', type: 'number' },
        { key: 'firstOrderBuyPrice', type: 'number' },
        { key: 'firstOrderSellPrice', type: 'number' },
        {
          key: 'tickRange',
          type: 'array',
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
        {
          key: 'fiveTickRange',
          type: 'array',
          option: {
            example: [
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
            ],
          },
        },
        { key: 'trendFlag', type: 'number' },
        { key: 'stockType', type: 'number' },
      ]),
    },
  })
  content: Record<string, any>;

  @ApiProperty({ example: 10 })
  totalSize: number;
}

export class IDisplayChartQuery {
  @ApiProperty({ example: '1' })
  stockId: string;

  @ApiProperty(getEnumDescription('dateFormat', false))
  dateFormat: DateFormatEnum;

  @ApiPropertyOptional(getRangeDescription(false))
  createdTime?: IRange<string>;
}

export const IDisplayChartQueryResponse = {
  type: 'array',
  items: {
    type: 'object',
    properties: getResponseProperties([
      { key: 'createdTime', type: 'date' },
      { key: 'quantity', type: 'number' },
      { key: 'open', type: 'number' },
      { key: 'highest', type: 'number' },
      { key: 'close', type: 'number' },
      { key: 'lowest', type: 'number' },
      { key: 'firstOrderBuy', type: 'number' },
      { key: 'firstOrderSell', type: 'number' },
    ]),
  },
};

export class IDisplayInsert {
  stockId: string;

  matchPrice: number;

  matchQuantity: number;

  marketBuyQuantity: number;

  marketSellQuantity: number;

  buyTick: string;

  sellTick: string;

  closedPrice: number;

  trendFlag: TrendFlagEnum;

  stockType: StockTypeEnum;

  priceLimit: number;

  createdTime?: Date;
}

export const IDisplayObjectResponse = {
  type: 'object',
  properties: getResponseProperties([
    { key: 'stockId', type: 'number' },
    { key: 'matchPrice', type: 'number' },
    { key: 'matchQuantity', type: 'number' },
    { key: 'marketBuyQuantity', type: 'number' },
    { key: 'marketSellQuantity', type: 'number' },
    { key: 'firstOrderBuyPrice', type: 'number' },
    { key: 'firstOrderSellPrice', type: 'number' },
    {
      key: 'tickRange',
      type: 'array',
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
    {
      key: 'fiveTickRange',
      type: 'array',
      option: {
        example: [
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
        ],
      },
    },
    { key: 'trendFlag', type: 'number' },
    { key: 'stockType', type: 'number' },
  ]),
};

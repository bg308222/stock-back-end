import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { VirtualOrder } from 'src/common/entity/virtualOrder.entity';
import { VirtualOrderContainer } from 'src/common/entity/virtualOrderContainer.entity';
import {
  MethodEnum,
  PriceTypeEnum,
  QueryStrategyEnum,
  TimeRestrictiomEnum,
} from 'src/common/enum';
import {
  getEnumDescription,
  getResponseProperties,
} from 'src/common/helper/document.helper';
import { CommonQuery, IQueryStategy } from 'src/common/type';

export type IVirtualOrderContainerSchema = VirtualOrderContainer;
export type IVirtualOrderSchema = Omit<
  VirtualOrder,
  'virtualOrderContainer' | 'order'
>;

export class IVirtualOrderContainerQuery extends PartialType(CommonQuery) {
  @ApiPropertyOptional()
  id?: number;

  @ApiPropertyOptional()
  investorId?: number;

  @ApiPropertyOptional()
  stockId?: number;
}

export const queryStrategy: IQueryStategy<IVirtualOrderContainerQuery> = {
  id: QueryStrategyEnum.value,
  investorId: QueryStrategyEnum.value,
  stockId: QueryStrategyEnum.value,
};

export class IVirtualOrderContainerQueryResponse {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: getResponseProperties<IVirtualOrderContainerSchema>([
        { key: 'id', type: 'number' },
        { key: 'stockId', type: 'number' },
        { key: 'investorId', type: 'number' },
        { key: 'createdTime', type: 'date' },
        { key: 'updatedTime', type: 'date' },
        {
          key: 'orders',
          type: 'json',
          option: {
            example: [
              {
                investorId: 0,
                stockId: 1,
                method: 0,
                subMethod: null,
                price: 99,
                quantity: 10,
                priceType: 0,
                timeRestriction: 1,
                orderId: null,
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

export class IVirtualOrderContainerInsert {
  @ApiProperty({
    example: 1,
  })
  investorId: number;

  @ApiProperty({
    example: 1,
  })
  stockId: number;
}

export class IVirtualOrderInsert {
  @ApiProperty(getEnumDescription('method', false))
  method: MethodEnum;

  @ApiProperty()
  price: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty(getEnumDescription('priceType', false))
  priceType: PriceTypeEnum;

  @ApiProperty(getEnumDescription('timeRestriction', false))
  timeRestriction: TimeRestrictiomEnum;

  @ApiProperty()
  virtualOrderContainerId: number;
}

export class IVirtualOrderDelete {
  @ApiProperty()
  id: number;

  @ApiProperty()
  quantity: number;
}

export const IVirtuaoOrderInsertAndDeleteResponse = {
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
  ]),
};

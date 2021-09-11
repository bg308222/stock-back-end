import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { VirtualOrder } from 'src/common/entity/virtualOrder.entity';
import { VirtualOrderContainer } from 'src/common/entity/virtualOrderContainer.entity';
import {
  MethodEnum,
  PriceTypeEnum,
  QueryStrategyEnum,
  SubMethodEnum,
  TimeRestrictiomEnum,
} from 'src/common/enum';
import {
  getEnumDescription,
  getResponseProperties,
} from 'src/common/helper/document.helper';
import { CommonQuery, IQueryStategy } from 'src/common/type';

export type IVirtualOrderContainerSchema = VirtualOrderContainer;
export type IVirtualOrderSchema = Omit<VirtualOrder, 'virtualOrderContainer'>;

export class IVirtualOrderQuery extends PartialType(CommonQuery) {
  @ApiProperty({ required: true })
  virtualOrderContainerId: number;
}

export const orderQueryStrategy: IQueryStategy<IVirtualOrderQuery> = {
  virtualOrderContainerId: QueryStrategyEnum.value,
};

export class IVirtualOrderQueryResponse {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: getResponseProperties<IVirtualOrderSchema>([
        { key: 'id', type: 'number' },
        { key: 'createdTime', type: 'date' },
        { key: 'method', type: 'number' },
        { key: 'subMethod', type: 'number' },
        { key: 'price', type: 'number' },
        { key: 'quantity', type: 'number' },
        { key: 'priceType', type: 'number' },
        { key: 'timeRestriction', type: 'number' },
      ]),
    },
  })
  content: Record<string, any>;

  @ApiProperty({ example: 10 })
  totalSize: number;
}

export class IVirtualOrderContainerQuery extends PartialType(CommonQuery) {
  @ApiPropertyOptional()
  id?: number;

  @ApiPropertyOptional()
  stockId?: string;

  @ApiPropertyOptional()
  name?: string;
}

export const containerQueryStrategy: IQueryStategy<IVirtualOrderContainerQuery> =
  {
    id: QueryStrategyEnum.value,
    stockId: QueryStrategyEnum.value,
    name: QueryStrategyEnum.fuzzy,
  };

export class IVirtualOrderContainerQueryResponse {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: getResponseProperties<IVirtualOrderContainerSchema>([
        { key: 'id', type: 'number' },
        { key: 'stockId', type: 'number' },
        { key: 'name', type: 'string' },
        { key: 'createdTime', type: 'date' },
        { key: 'updatedTime', type: 'date' },
      ]),
    },
  })
  content: Record<string, any>;

  @ApiProperty({ example: 10 })
  totalSize: number;
}

export class IVirtualOrderContainerInsert {
  @ApiProperty({
    example: '1',
  })
  stockId: string;

  @ApiProperty()
  name: string;
}

export class IVirtualOrderInsert {
  @ApiProperty(getEnumDescription('method', false))
  method: MethodEnum;

  @ApiProperty(getEnumDescription('subMethod', false))
  subMethod: SubMethodEnum;

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

  @ApiProperty()
  delay: number;
}

export class IVirtualOrderContainerUpdate {
  @ApiProperty({ required: true, example: 1, description: '要修改情境id' })
  id: number;

  @ApiProperty({ required: false })
  name?: string;
}

export class IVirtualOrderContainerDelete {
  @ApiProperty({
    required: true,
    example: [1],
    isArray: true,
  })
  id: number[];
}

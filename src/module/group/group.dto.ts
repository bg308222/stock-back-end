import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Group } from 'src/common/entity/group.entity';
import { QueryStrategyEnum } from 'src/common/enum';
import { getResponseProperties } from 'src/common/helper/document.helper';
import { CommonQuery, IQueryStategy } from 'src/common/type';
export type IGroupSchema = Group;

export class IGroupQuery extends PartialType(CommonQuery) {
  @ApiPropertyOptional()
  id?: number;

  @ApiPropertyOptional({ example: '123' })
  name?: string;
}

export const queryStrategy: IQueryStategy<IGroupQuery> = {
  id: QueryStrategyEnum.value,
  name: QueryStrategyEnum.fuzzy,
};

export class IGroupQueryResponse {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: getResponseProperties<IGroupSchema>([
        { key: 'id', type: 'number' },
        { key: 'name', type: 'string' },
        {
          key: 'stocks',
          type: 'array',
          option: {
            example: [
              {
                id: 1,
                closedPrice: 100,
                priceLimit: 10,
                currentPrice: 100,
                createdTime: '2021-08-16T12:08:55.880Z',
                updatedTime: '2021-08-16T15:32:09.000Z',
                virtualOrderContainerId: null,
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

export class IGroupInsert {
  @ApiProperty({ example: 1 })
  name: string;

  @ApiPropertyOptional({ example: ['1', '2'], isArray: true })
  stockId: string[];
}

export class IGroupUpdate {
  @ApiProperty({
    required: true,
    example: [1],
    isArray: true,
  })
  id: number;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional({ example: [1, 2], isArray: true })
  stockId?: string[];
}

export class IGroupDelete {
  @ApiProperty({
    required: true,
    example: [1],
    isArray: true,
  })
  id: number[];
}

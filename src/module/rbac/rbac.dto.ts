import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Role } from 'src/common/entity/role.entity';
import { QueryStrategyEnum } from 'src/common/enum';
import { getResponseProperties } from 'src/common/helper/document.helper';
import { CommonQuery, IQueryStategy, IRange } from 'src/common/type';

export class IRoleQuery extends PartialType(CommonQuery) {
  @ApiPropertyOptional()
  id?: number;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  totalApiTime?: IRange<number>;
}

export const queryStrategy: IQueryStategy<IRoleQuery> = {
  id: QueryStrategyEnum.value,
  name: QueryStrategyEnum.fuzzy,
  totalApiTime: QueryStrategyEnum.range,
};

export class IRoleInsert {
  @ApiProperty({
    example: 'roleName',
  })
  name: string;

  @ApiPropertyOptional()
  totalApiTime?: number;

  @ApiPropertyOptional()
  permissions?: string[];
}

export class IRoleUpdate {
  @ApiProperty()
  id: number;

  @ApiPropertyOptional({
    example: 'roleName',
  })
  name?: string;

  @ApiPropertyOptional()
  totalApiTime?: number;

  @ApiPropertyOptional()
  permissions?: string[];
}

export class IRoleDelete {
  @ApiProperty({
    required: true,
    example: [2, 3],
    isArray: true,
  })
  id: number[];
}

export class IRoleQueryResponse {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: getResponseProperties<Role>([
        { key: 'id', type: 'number' },
        { key: 'name', type: 'string' },
        { key: 'totalApiTime', type: 'number' },
        { key: 'createdTime', type: 'date' },
        { key: 'updatedTime', type: 'date' },
        { key: 'permissions', type: 'array' },
      ]),
    },
  })
  content: Record<string, any>;

  @ApiProperty({ example: 10 })
  totalSize: number;
}

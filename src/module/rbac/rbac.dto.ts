import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { QueryStrategyEnum } from 'src/common/enum';
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

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { QueryStrategyEnum } from 'src/common/enum';
import { CommonQuery, IQueryStategy, IRange } from 'src/common/type';

export class IInvestorQuery extends PartialType(CommonQuery) {
  id: number;
  account: string;
}

export const queryStrategy: IQueryStategy<IInvestorQuery> = {
  id: QueryStrategyEnum.value,
  account: QueryStrategyEnum.fuzzy,
};

export class IInvestorInsert {
  @ApiProperty({ example: 'admin' })
  account: string;

  @ApiProperty({ example: 'admin' })
  password: string;
}

export class IInvestorUpdate {
  @ApiProperty()
  id: number;

  @ApiPropertyOptional({ example: 'admin' })
  account: string;

  @ApiPropertyOptional({ example: 'admin' })
  password: string;

  @ApiPropertyOptional()
  totalApiTime: number;

  @ApiPropertyOptional()
  restApiTime: number;

  @ApiPropertyOptional()
  roleId: number;
}

export class IInvestorDelete {
  @ApiProperty({
    required: true,
    example: [2, 3],
    isArray: true,
  })
  id: number[];
}

export class IInvestorLogin {
  @ApiProperty({ example: 'admin' })
  account: string;

  @ApiProperty({ example: 'admin' })
  password: string;
}

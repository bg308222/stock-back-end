import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Investor } from 'src/common/entity/investor.entity';
import { QueryStrategyEnum } from 'src/common/enum';
import { getResponseProperties } from 'src/common/helper/document.helper';
import { CommonQuery, IQueryStategy } from 'src/common/type';

export class IInvestorQuery extends PartialType(CommonQuery) {
  id: number;
  account: string;
}

export type IInvestorSchema = Omit<Investor, 'password' | 'roleId'>;

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

export class IInvestorQueryResponse {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: getResponseProperties<IInvestorSchema>([
        { key: 'id', type: 'number' },
        { key: 'account', type: 'string' },
        { key: 'totalApiTime', type: 'number' },
        { key: 'restApiTime', type: 'number' },
        { key: 'createdTime', type: 'date' },
        { key: 'updatedTime', type: 'date' },
        { key: 'expiredTime', type: 'date' },
        { key: 'role', type: 'json' },
      ]),
    },
  })
  content: Record<string, any>;

  @ApiProperty({ example: 10 })
  totalSize: number;
}

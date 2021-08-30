import { ApiProperty, PartialType } from '@nestjs/swagger';
import { QueryStrategyEnum } from 'src/common/enum';
import { CommonQuery, IQueryStategy, IRange } from 'src/common/type';

export class IInvestorQuery extends PartialType(CommonQuery) {
  id: number;
  account: string;
  createdTime: IRange<string>;
}

export const queryStrategy: IQueryStategy<IInvestorQuery> = {
  id: QueryStrategyEnum.value,
  account: QueryStrategyEnum.fuzzy,
  createdTime: QueryStrategyEnum.range,
};

export class IInvestorInsert {
  @ApiProperty({ example: 'admin' })
  account: string;

  @ApiProperty({ example: 'admin' })
  password: string;
}
export class IInvestorLogin {
  @ApiProperty({ example: 'admin' })
  account: string;

  @ApiProperty({ example: 'admin' })
  password: string;
}

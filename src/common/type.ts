import { ApiPropertyOptional } from '@nestjs/swagger';
import { Investor } from './entity/investor.entity';
import { QueryStrategyEnum } from './enum';
import { getPageDescription } from './helper/document.helper';

export interface IRange<T = any> {
  min?: T;
  max?: T;
}

export interface IPage {
  page: number;
  pageSize: number;
}

export interface IOrder {
  orderBy: string;
  order: 'ASC' | 'DESC';
}

type InvestorSchema = Investor;

export class CommonQuery {
  @ApiPropertyOptional(getPageDescription())
  page?: IPage;

  order?: IOrder;

  investor?: InvestorSchema;
}

export type IQueryStategy<T = any> = Record<
  Exclude<keyof T, 'page' | 'order' | 'investor'>,
  QueryStrategyEnum
>;

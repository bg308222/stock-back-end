import { ApiPropertyOptional } from '@nestjs/swagger';
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

export type IQueryStategy<T = any> = Record<
  Exclude<keyof T, 'page'>,
  QueryStrategyEnum
>;

export class CommonQuery {
  @ApiPropertyOptional(getPageDescription())
  page?: IPage;
}

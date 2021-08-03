import { QueryStrategyEnum } from './enum';

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

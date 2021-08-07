import { SelectQueryBuilder } from 'typeorm';
import { QueryStrategyEnum } from '../enum';
import { IQueryStategy } from '../type';

export const getQueryBuilderContent = async <T = any>(
  alias: string,
  queryBuilder: SelectQueryBuilder<T>,
  queryStrategy: IQueryStategy<any>,
  query: Record<string, any>,
) => {
  const fullQueryBuilder = queryBuilder;
  Object.entries(query).forEach(([key, value]) => {
    if (!value) return;
    switch (queryStrategy[key]) {
      case QueryStrategyEnum.value: {
        const param = {};
        param[key] = value;
        fullQueryBuilder.andWhere(`${alias}.${key} = :${key}`, param);
        break;
      }
      case QueryStrategyEnum.inArray: {
        const param = {};
        param[key] = value;
        fullQueryBuilder.andWhere(`${alias}.${key} IN (:...${key})`, param);
        break;
      }
      case QueryStrategyEnum.range: {
        if (value.max) {
          const param = {};
          const paramKey = `${key}Max`;
          param[paramKey] = value.max;
          fullQueryBuilder.andWhere(`${alias}.${key} < :${paramKey}`, param);
        }
        if (value.min) {
          const param = {};
          const paramKey = `${key}Min`;
          param[paramKey] = value.min;
          fullQueryBuilder.andWhere(`${alias}.${key} >= :${paramKey}`, param);
        }
        break;
      }
      case QueryStrategyEnum.fuzzy: {
        const param = {};
        param[key] = `%${value}%`;
        fullQueryBuilder.andWhere(`${alias}.${key} LIKE :${key}`, param);
        break;
      }
      default: {
      }
    }
  });

  if (query.order && query.order.order && query.order.orderBy) {
    fullQueryBuilder.orderBy(query.order.orderBy, query.order.order);
  } else {
    fullQueryBuilder.orderBy('createdTime', 'DESC');
  }

  const totalSize = await fullQueryBuilder.getCount();
  if (query.page && query.page.page && query.page.pageSize) {
    fullQueryBuilder.offset((query.page.page - 1) * query.page.pageSize);
    fullQueryBuilder.limit(query.page.pageSize);
  }
  return { fullQueryBuilder, totalSize };
};

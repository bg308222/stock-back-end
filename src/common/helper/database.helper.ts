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
        fullQueryBuilder.andWhere(`${alias}.${key} = :value`, { value });
        break;
      }
      case QueryStrategyEnum.inArray: {
        fullQueryBuilder.andWhere(`${alias}.${key} IN (:...value)`, { value });
        break;
      }
      case QueryStrategyEnum.range: {
        if (value.max) {
          fullQueryBuilder.andWhere(`${alias}.${key} < value`, {
            value,
          });
        }
        if (value.min) {
          fullQueryBuilder.andWhere(`${alias}.${key} => value`, {
            value,
          });
        }
        break;
      }
      case QueryStrategyEnum.fuzzy: {
        fullQueryBuilder.andWhere(`${alias}.${key} LIKE :value`, {
          value: `%${value}%`,
        });
        break;
      }
      default: {
      }
    }
  });

  const totalSize = await fullQueryBuilder.getCount();
  if (query.page && query.page.page && query.page.pageSize) {
    fullQueryBuilder.offset((query.page.page - 1) * query.page.pageSize);
    fullQueryBuilder.limit(query.page.pageSize);
  }
  fullQueryBuilder.orderBy('createdTime', 'DESC');
  return { fullQueryBuilder, totalSize };
};

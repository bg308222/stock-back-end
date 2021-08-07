import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Stock } from 'src/common/entity/stock.entity';
import { getQueryBuilderContent } from 'src/common/helper/database.helper';
import { Repository } from 'typeorm';
import { IStockQuery, IStockSchema, queryStrategy } from './stock.dto';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
  ) {}

  public async get(query: IStockQuery) {
    const { fullQueryBuilder, totalSize } =
      await getQueryBuilderContent<IStockSchema>(
        'stock',
        this.stockRepository.createQueryBuilder('stock'),
        queryStrategy,
        query,
      );

    return {
      content: await fullQueryBuilder.getMany(),
      totalSize,
    };
  }
}

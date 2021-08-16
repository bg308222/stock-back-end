import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Stock } from 'src/common/entity/stock.entity';
import { getQueryBuilderContent } from 'src/common/helper/database.helper';
import { Repository } from 'typeorm';
import {
  IStockQuery,
  IStockSchema,
  IStockUpdate,
  queryStrategy,
} from './stock.dto';

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

  public async update({ id, ...body }: IStockUpdate) {
    const stock = await this.stockRepository.findOne({ id });
    if (!stock) throw new BadRequestException('Stock doesn"t exist');
    return await this.stockRepository.save({ ...stock, ...body });
  }
}

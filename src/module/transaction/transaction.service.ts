import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/common/entity/transaction.entity';
import { getQueryBuilderContent } from 'src/common/helper/database.helper';
import { Repository } from 'typeorm';
import { ITransactionQuery, queryStrategy } from './transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly orderRepository: Repository<Transaction>,
  ) {}

  public async get(query: ITransactionQuery) {
    const { fullQueryBuilder, totalSize } = await getQueryBuilderContent(
      'order',
      this.orderRepository.createQueryBuilder('order'),
      queryStrategy,
      query,
    );
    // console.log(await limit.getMany());
    return {
      content: await fullQueryBuilder.getMany(),
      totalSize,
    };
  }
}

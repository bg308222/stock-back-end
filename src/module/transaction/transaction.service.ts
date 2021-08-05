import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/common/entity/transaction.entity';
import { getQueryBuilderContent } from 'src/common/helper/database.helper';
import { Repository } from 'typeorm';
import {
  ITransactionBody,
  ITransactionQuery,
  queryStrategy,
} from './transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  public async get(query: ITransactionQuery) {
    const { fullQueryBuilder, totalSize } = await getQueryBuilderContent(
      'transaction',
      this.transactionRepository.createQueryBuilder('transaction'),
      queryStrategy,
      query,
    );
    return {
      content: await fullQueryBuilder.getMany(),
      totalSize,
    };
  }

  public async insert(body: ITransactionBody[]) {
    return await this.transactionRepository.insert(
      body.map((data) => {
        return {
          ...data,
          investor: { id: data.investorId },
          stock: { id: data.stockId },
        };
      }),
    );
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Investor } from 'src/common/entity/investor.entity';
import { Order } from 'src/common/entity/order.entity';
import { Stock } from 'src/common/entity/stock.entity';
import { getQueryBuilderContent } from 'src/common/helper/database.helper';
import { Repository } from 'typeorm';
import { IOrderQuery, IOrderBody, queryStrategy } from './order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  public async get(query: IOrderQuery) {
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

  public async insert(body: IOrderBody[]) {
    return await this.orderRepository.insert(
      body.map((data) => {
        return {
          ...data,
          investor: new Investor(data.investorId),
          stock: new Stock(data.stockId),
        };
      }),
    );
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/common/entity/order.entity';
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
    return {
      content: await fullQueryBuilder.getMany(),
      totalSize,
    };
  }

  public async insert(body: IOrderBody) {
    return await this.orderRepository.insert({
      ...body,
      investor: { id: body.investorId },
      stock: { id: body.stockId },
    });
  }
}

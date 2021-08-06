import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/common/entity/order.entity';
import { OrderStatusEnum, SubMethodEnum } from 'src/common/enum';
import { getQueryBuilderContent } from 'src/common/helper/database.helper';
import { Repository } from 'typeorm';
import {
  IOrderQuery,
  IOrderInsert,
  queryStrategy,
  IOrderDelete,
  IOrderSchema,
} from './order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  public async get(query: IOrderQuery) {
    const { fullQueryBuilder, totalSize } =
      await getQueryBuilderContent<IOrderSchema>(
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

  public async insert(body: IOrderInsert): Promise<IOrderSchema> {
    const { generatedMaps } = (await this.orderRepository.insert({
      ...body,
      investor: { id: body.investorId },
      stock: { id: body.stockId },
    })) as any;

    return {
      ...body,
      ...generatedMaps[0],
    };
  }

  public async updateStatusToFail(id: number) {
    const order = await this.orderRepository.findOne({ id });
    order.status = OrderStatusEnum.FAIL;
    await this.orderRepository.save(order);
  }

  public async delete({ id, quantity }: IOrderDelete): Promise<IOrderSchema> {
    if (!id) throw new BadRequestException('Missing id');
    if (!quantity) throw new BadRequestException('Missing quantity');

    const {
      id: skip1,
      createdTime: skip2,
      ...order
    } = await this.orderRepository.findOne({
      id,
    });

    const { generatedMaps } = await this.orderRepository.insert({
      ...order,
      subMethod: SubMethodEnum.CANCEL,
      quantity,
      order: { id },
    });

    return {
      ...order,
      id: generatedMaps[0].id,
      createdTime: generatedMaps[0].createdTime,
      subMethod: SubMethodEnum.CANCEL,
      quantity,
      orderId: id,
    };
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VirtualOrder } from 'src/common/entity/virtualOrder.entity';
import { VirtualOrderContainer } from 'src/common/entity/virtualOrderContainer.entity';
import { SubMethodEnum } from 'src/common/enum';
import { getQueryBuilderContent } from 'src/common/helper/database.helper';
import { Repository } from 'typeorm';
import { IOrderDelete } from '../order/order.dto';
import {
  IVirtualOrderContainerInsert,
  IVirtualOrderContainerQuery,
  IVirtualOrderContainerSchema,
  IVirtualOrderInsert,
  queryStrategy,
} from './virtualOrder.dto';

@Injectable()
export class VirtualOrderService {
  constructor(
    @InjectRepository(VirtualOrder)
    private readonly virtualOrderRepository: Repository<VirtualOrder>,

    @InjectRepository(VirtualOrderContainer)
    private readonly virtualOrderContainerRepository: Repository<VirtualOrderContainer>,
  ) {}

  public async getContainer(query: IVirtualOrderContainerQuery) {
    const { fullQueryBuilder, totalSize } =
      await getQueryBuilderContent<IVirtualOrderContainerSchema>(
        'virtualOrderContainer',
        this.virtualOrderContainerRepository.createQueryBuilder(
          'virtualOrderContainer',
        ),
        queryStrategy,
        query,
      );

    const content = await Promise.all(
      (
        await fullQueryBuilder.getMany()
      ).map(async (container) => {
        return {
          ...container,
          orders: (
            await this.virtualOrderRepository
              .createQueryBuilder('order')
              .where('order.virtualOrderContainerId = :id', {
                id: container.id,
              })
              .orderBy('createdTime', 'ASC')
              .getMany()
          ).map(({ id, createdTime, virtualOrderContainerId, ...order }) => {
            return {
              investorId: 0,
              stockId: container.stockId,
              ...order,
            };
          }),
        };
      }),
    );
    return {
      content,
      totalSize,
    };
  }

  public async getContainerById(id: number, orderId: number) {
    const result = await this.virtualOrderContainerRepository.findOne({ id });
    return {
      stockId: result.stockId,
      order: result.orders.find((order) => {
        return order.id === orderId;
      }),
    };
  }

  public async insertContainer(body: IVirtualOrderContainerInsert) {
    return await this.virtualOrderContainerRepository.insert(body);
  }

  public async insertOrder(body: IVirtualOrderInsert) {
    const { generatedMaps } = await this.virtualOrderRepository.insert(body);
    return generatedMaps[0].id as number;
  }
}

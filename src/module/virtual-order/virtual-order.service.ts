import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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
        console.log(container);

        return {
          ...container,
          orders: await this.virtualOrderRepository
            .createQueryBuilder('order')
            .where('order.virtualOrderContainerId = :id', { id: container.id })
            .orderBy('createdTime', 'ASC')
            .getMany(),
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

  public async deleteOrder({ id, quantity }: IOrderDelete) {
    if (!id) throw new BadRequestException('Missing id');
    if (!quantity) throw new BadRequestException('Missing quantity');

    const {
      id: skip1,
      createdTime: skip2,
      ...order
    } = await this.virtualOrderRepository.findOne({
      id,
    });

    const { generatedMaps } = await this.virtualOrderRepository.insert({
      ...order,
      subMethod: SubMethodEnum.CANCEL,
      quantity,
      order: { id },
    });

    return {
      virtualOrderContainerId: order.virtualOrderContainerId,
      id: generatedMaps[0].id,
    };
  }
}

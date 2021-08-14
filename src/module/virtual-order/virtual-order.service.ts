import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VirtualOrder } from 'src/common/entity/virtualOrder.entity';
import { VirtualOrderContainer } from 'src/common/entity/virtualOrderContainer.entity';
import { SubMethodEnum } from 'src/common/enum';
import { getQueryBuilderContent } from 'src/common/helper/database.helper';
import { Repository } from 'typeorm';
import { IMarketBook } from '../match/match.helper';
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
      ).map(async ({ marketBook, ...container }) => {
        return {
          ...container,
          // orders: (
          //   await this.virtualOrderRepository
          //     .createQueryBuilder('order')
          //     .where('order.virtualOrderContainerId = :id', {
          //       id: container.id,
          //     })
          //     .orderBy('createdTime', 'ASC')
          //     .getMany()
          // ).map(({ id, createdTime, virtualOrderContainerId, ...order }) => {
          //   return {
          //     investorId: 0,
          //     stockId: container.stockId,
          //     ...order,
          //   };
          // }),
        };
      }),
    );
    return {
      content,
      totalSize,
    };
  }

  public async getContainerDetail(id: number) {
    const container = await this.virtualOrderContainerRepository.findOne({
      id,
    });
    return container;
  }

  public async resetContainer(id: number) {
    const container = await this.virtualOrderContainerRepository.findOne({
      id,
    });
    container.marketBook = null;
    await this.virtualOrderContainerRepository.save(container);
    await this.virtualOrderRepository.delete({ virtualOrderContainerId: id });
    return container;
  }

  public async insertContainer(body: IVirtualOrderContainerInsert) {
    const { generatedMaps } = await this.virtualOrderContainerRepository.insert(
      body,
    );
    return generatedMaps[0].id as number;
  }

  public async updateContainer({
    id,
    marketBook,
  }: {
    id: number;
    marketBook: IMarketBook | null;
  }) {
    const container = await this.virtualOrderContainerRepository.findOne({
      id,
    });

    container.marketBook =
      marketBook === null ? null : JSON.stringify(marketBook);
    return await this.virtualOrderContainerRepository.save(container);
  }

  public async insertOrder(body: IVirtualOrderInsert) {
    const { generatedMaps } = await this.virtualOrderRepository.insert(body);
    return generatedMaps[0].id as number;
  }

  public async deleteContainer(id: number) {
    await this.virtualOrderContainerRepository.delete(id);
    return true;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VirtualOrder } from 'src/common/entity/virtualOrder.entity';
import { VirtualOrderContainer } from 'src/common/entity/virtualOrderContainer.entity';
import { getQueryBuilderContent } from 'src/common/helper/database.helper';
import { Repository } from 'typeorm';
import { IMarketBook } from '../match/match.helper';
import {
  containerQueryStrategy,
  IVirtualOrderContainerInsert,
  IVirtualOrderContainerQuery,
  IVirtualOrderContainerSchema,
  IVirtualOrderInsert,
  IVirtualOrderQuery,
  IVirtualOrderSchema,
  orderQueryStrategy,
} from './virtualOrder.dto';

@Injectable()
export class VirtualOrderService {
  constructor(
    @InjectRepository(VirtualOrder)
    private readonly virtualOrderRepository: Repository<VirtualOrder>,

    @InjectRepository(VirtualOrderContainer)
    private readonly virtualOrderContainerRepository: Repository<VirtualOrderContainer>,
  ) {}

  public async getVirtualOrder(query: IVirtualOrderQuery) {
    const { fullQueryBuilder, totalSize } =
      await getQueryBuilderContent<IVirtualOrderSchema>(
        'virtualOrder',
        this.virtualOrderRepository.createQueryBuilder('virtualOrder'),
        orderQueryStrategy,
        { ...query, order: { orderBy: 'createdTime', order: 'ASC' } },
      );

    return {
      content: (await fullQueryBuilder.getMany()).map(
        ({ virtualOrderContainerId, ...order }) => {
          return order;
        },
      ),
      totalSize,
    };
  }

  public async getContainer(query: IVirtualOrderContainerQuery) {
    const { fullQueryBuilder, totalSize } =
      await getQueryBuilderContent<IVirtualOrderContainerSchema>(
        'virtualOrderContainer',
        this.virtualOrderContainerRepository.createQueryBuilder(
          'virtualOrderContainer',
        ),
        containerQueryStrategy,
        query,
      );

    const content = await Promise.all(
      (
        await fullQueryBuilder.getMany()
      ).map(async ({ marketBook, ...container }) => {
        return {
          ...container,
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

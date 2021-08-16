import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Stock } from 'src/common/entity/stock.entity';
import { VirtualOrder } from 'src/common/entity/virtualOrder.entity';
import { VirtualOrderContainer } from 'src/common/entity/virtualOrderContainer.entity';
import { getQueryBuilderContent } from 'src/common/helper/database.helper';
import { Repository } from 'typeorm';
import { IMarketBook } from '../match/match.helper';
import {
  containerQueryStrategy,
  IVirtualOrderContainerDelete,
  IVirtualOrderContainerInsert,
  IVirtualOrderContainerQuery,
  IVirtualOrderContainerSchema,
  IVirtualOrderContainerUpdate,
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

    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
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

  public async updateContainer({ id, ...body }: IVirtualOrderContainerUpdate) {
    const container = await this.virtualOrderContainerRepository.findOne({
      id,
    });
    if (!container) throw new BadRequestException("Container doesn't exist");
    await this.virtualOrderContainerRepository.save({ ...container, ...body });
    return true;
  }

  public async updateMarketBook({
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

  public async deleteContainer(body: IVirtualOrderContainerDelete) {
    await this.virtualOrderContainerRepository.delete(body.id);
    await Promise.all(
      body.id.map(async (id) => {
        const stocks = (
          await this.stockRepository.find({
            virtualOrderContainerId: id,
          })
        ).map((stock) => {
          return {
            ...stock,
            virtualOrderContainerId: null,
          };
        });
        await this.stockRepository.save(stocks);
      }),
    );

    return true;
  }
}

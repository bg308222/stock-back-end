import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from 'src/common/entity/group.entity';
import { Stock } from 'src/common/entity/stock.entity';
import { VirtualOrderContainer } from 'src/common/entity/virtualOrderContainer.entity';
import { getQueryBuilderContent } from 'src/common/helper/database.helper';
import { Repository } from 'typeorm';
import { IMarketBook } from '../match/match.helper';
import {
  IStockDelete,
  IStockInsert,
  IStockQuery,
  IStockSchema,
  IStockUpdate,
  queryStrategy,
} from './stock.dto';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(VirtualOrderContainer)
    private readonly virtualOrderContainerRepository: Repository<VirtualOrderContainer>,
  ) {}

  public async get(query: IStockQuery) {
    const { fullQueryBuilder, totalSize } =
      await getQueryBuilderContent<IStockSchema>(
        'stock',
        this.stockRepository.createQueryBuilder('stock'),
        queryStrategy,
        query,
      );

    fullQueryBuilder.leftJoinAndSelect('stock.groups', 'groups');
    const content = await fullQueryBuilder.getMany();
    return {
      content: content.filter((stock) => !stock.id.startsWith('REPLAY')),
      totalSize,
    };
  }

  public async insert({ id, groupId, ...body }: IStockInsert) {
    await this.stockRepository.insert({ id, ...body });

    if (groupId) {
      await this.update({ id, groupId });
    }
    return true;
  }

  public async update({ id, groupId, ...body }: IStockUpdate) {
    const stock = await this.stockRepository.findOne({ id });
    if (!stock) throw new BadRequestException('Stock doesn"t exist');

    if (groupId) {
      stock.groups = groupId.map((id) => {
        const group = new Group();
        group.id = id;
        return group;
      });
    }
    await this.stockRepository.save({ ...stock, ...body });
    return { ...stock, ...body };
  }

  public async delete(body: IStockDelete) {
    await this.stockRepository.delete(body.id);
    return true;
  }

  public async getVirtualOrderContainer(id: number) {
    const container = await this.virtualOrderContainerRepository.findOne({
      id,
    });
    if (!container)
      throw new ForbiddenException("Virtual order container doesn't exist");
    return JSON.parse(container.marketBook) as IMarketBook;
  }
}

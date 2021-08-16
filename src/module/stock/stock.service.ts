import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Stock } from 'src/common/entity/stock.entity';
import { VirtualOrderContainer } from 'src/common/entity/virtualOrderContainer.entity';
import { getQueryBuilderContent } from 'src/common/helper/database.helper';
import { Repository } from 'typeorm';
import {
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

    const content = await fullQueryBuilder.getMany();
    return {
      content: await Promise.all(
        content.map(async (stock) => {
          const virtualOrderContainer =
            await this.virtualOrderContainerRepository.findOne({
              id: stock.virtualOrderContainerId,
            });
          return {
            ...stock,
            virtualOrderContainer: virtualOrderContainer
              ? virtualOrderContainer
              : undefined,
          };
        }),
      ),
      totalSize,
    };
  }

  public async update({ id, ...body }: IStockUpdate) {
    const stock = await this.stockRepository.findOne({ id });
    if (!stock) throw new BadRequestException('Stock doesn"t exist');
    if (body.virtualOrderContainerId) {
      if (
        !(await this.virtualOrderContainerRepository.findOne({
          id: body.virtualOrderContainerId,
        }))
      )
        throw new BadRequestException("Virtual order container doesn't exist");
    }
    return await this.stockRepository.save({ ...stock, ...body });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Display } from 'src/common/entity/display.entity';
import { getQueryBuilderContent } from 'src/common/helper/database.helper';
import { Repository } from 'typeorm';
import {
  IDisplayInsert,
  IDisplayQuery,
  IDisplaySchema,
  queryStrategy,
} from './display.dto';

const transferResult = (displaySchema?: IDisplaySchema) => {
  if (!displaySchema) return null;
  const {
    buyFiveTick: buyFiveTickJson,
    sellFiveTick: sellFiveTickJson,
    tickRange: tickRangeJson,
    ...data
  } = displaySchema;
  const buyFiveTick = JSON.parse(buyFiveTickJson) as number[];
  const sellFiveTick = JSON.parse(sellFiveTickJson) as number[];
  const tickRange = JSON.parse(tickRangeJson) as number[];
  let firstOrderBuyPrice = null;
  let firstOrderSellPrice = null;
  tickRange.forEach((price, index) => {
    if (firstOrderBuyPrice === null && buyFiveTick[index] !== 0)
      firstOrderBuyPrice = price;
    if (sellFiveTick[index] !== 0) firstOrderSellPrice = price;
  });

  return {
    ...data,
    buyFiveTick,
    sellFiveTick,
    tickRange,
    firstOrderBuyPrice,
    firstOrderSellPrice,
  };
};
@Injectable()
export class DisplayService {
  constructor(
    @InjectRepository(Display)
    private readonly displayRepository: Repository<Display>,
  ) {}

  public async get(query: IDisplayQuery) {
    const { fullQueryBuilder, totalSize } =
      await getQueryBuilderContent<IDisplaySchema>(
        'display',
        this.displayRepository.createQueryBuilder('display'),
        queryStrategy,
        query,
      );

    if (query.isGetLatest) {
      return transferResult(await fullQueryBuilder.getOne());
    }
    return {
      content: (await fullQueryBuilder.getMany()).map(transferResult),
      totalSize,
    };
  }

  public async insert(body: IDisplayInsert) {
    return await this.displayRepository.insert({
      ...body,
      stock: { id: body.stockId },
    });
  }
}

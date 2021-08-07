import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Display } from 'src/common/entity/display.entity';
import { getQueryBuilderContent } from 'src/common/helper/database.helper';
import { Repository } from 'typeorm';
import { getTickRange } from '../match/match.service';
import {
  IDisplayInsert,
  IDisplayQuery,
  IDisplaySchema,
  ITickRange,
  queryStrategy,
} from './display.dto';

const transferResult = (displaySchema?: IDisplaySchema) => {
  if (!displaySchema) return null;
  const {
    buyTick: buyTickJson,
    sellTick: sellTickJson,
    closedPrice,
    ...data
  } = displaySchema;
  const buyTick = JSON.parse(buyTickJson) as number[];
  const sellTick = JSON.parse(sellTickJson) as number[];
  const { numTickRange: tickRange } = getTickRange(closedPrice);
  let firstOrderBuyPrice = null;
  let firstOrderSellPrice = null;

  let fiveTickRange: number[] = [];
  const transferTickRange: ITickRange[] = tickRange.map((price, index) => {
    let marketBuyAdder = 0;
    let marketSellAdder = 0;
    if (price === data.matchPrice) {
      marketBuyAdder = data.marketBuyQuantity;
      marketSellAdder = data.marketSellQuantity;

      if (buyTick[index] === 0 && sellTick[index] !== 0) {
        fiveTickRange = [
          index - 4,
          index - 3,
          index - 2,
          index - 1,
          index,
          index + 1,
          index + 2,
          index + 3,
          index + 4,
          index + 5,
        ];
      }
      if (buyTick[index] !== 0 && sellTick[index] === 0) {
        fiveTickRange = [
          index - 5,
          index - 4,
          index - 3,
          index - 2,
          index - 1,
          index,
          index + 1,
          index + 2,
          index + 3,
          index + 4,
        ];
      }
      if (buyTick[index] === 0 && sellTick[index] === 0) {
        fiveTickRange = [
          index - 4,
          index - 3,
          index - 2,
          index - 1,
          index,
          index + 1,
          index + 2,
          index + 3,
          index + 4,
          index + 5,
        ];
      }
    }

    if (firstOrderBuyPrice === null && buyTick[index] !== 0)
      firstOrderBuyPrice = price;
    if (sellTick[index] !== 0) firstOrderSellPrice = price;
    return {
      price,
      buyQuantity: buyTick[index] + marketBuyAdder || 0,
      sellQuantity: sellTick[index] + marketSellAdder || 0,
    };
  });

  return {
    ...data,

    tickRange: transferTickRange,
    fiveTickRange: transferTickRange.filter((v, index) => {
      return fiveTickRange.includes(index);
    }),
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
      const result = transferResult(await fullQueryBuilder.getOne());
      return result;
    }
    const result = {
      content: (await fullQueryBuilder.getMany()).map(transferResult),
      totalSize,
    };
    return result;
  }

  public async insert(body: IDisplayInsert) {
    return await this.displayRepository.insert({
      ...body,
      stock: { id: body.stockId },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Display } from 'src/common/entity/display.entity';
import { Stock } from 'src/common/entity/stock.entity';
import { StockTypeEnum, TrendFlagEnum } from 'src/common/enum';
import {
  getDateFormatString,
  getQueryBuilderContent,
} from 'src/common/helper/database.helper';
import { Repository } from 'typeorm';
import { IFrequentDataQuery } from '../frequent-data/frequent-data.dto';
import { getTickAfterNTick, getTickRange } from '../match/match.service';
import {
  IDisplayChartQuery,
  IDisplayInsert,
  IDisplayQuery,
  IDisplaySchema,
  ITickRange,
  ITransferDisplay,
  queryStrategy,
} from './display.dto';

interface IChartReduceInput {
  price: number;
  quantity: number;
  createdTime: string;
  buyTick: string;
  sellTick: string;
  stockType: StockTypeEnum;
  priceLimit: number;
  closedPrice: number;
}

interface IChartReduceOutput {
  quantity: number;
  lowest: number;
  highest: number;
  open: number;
  close: number;
  firstOrderBuy: number;
  firstOrderSell: number;
}
@Injectable()
export class DisplayService {
  constructor(
    @InjectRepository(Display)
    private readonly displayRepository: Repository<Display>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
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
      const result = await this.transferDisplayToReturnType(
        await fullQueryBuilder.getOne(),
      );
      return result;
    }
    const content = await fullQueryBuilder.getMany();
    const result = {
      content: await Promise.all(content.map(this.transferDisplayToReturnType)),
      totalSize,
    };
    return result;
  }

  public async findAndDelete(query: IDisplayQuery) {
    const { fullQueryBuilder } = await getQueryBuilderContent<IDisplaySchema>(
      'display',
      this.displayRepository.createQueryBuilder('display'),
      queryStrategy,
      query,
    );

    const ids = (await fullQueryBuilder.getMany()).map((dispaly) => dispaly.id);
    if (ids.length !== 0) {
      await this.displayRepository.delete(ids);
      return true;
    }
    return false;
  }

  public async insert(body: IDisplayInsert) {
    return await this.displayRepository.insert({
      ...body,
      stock: { id: body.stockId },
    });
  }

  public async getChart({
    dateFormat: _dateFormat,
    stockId,
  }: IDisplayChartQuery) {
    const dateFormat = getDateFormatString(_dateFormat);
    const result = await this.displayRepository
      .createQueryBuilder('display')
      .select(`DATE_FORMAT(display.createdTime,'${dateFormat}')`, 'createdTime')
      .addSelect('display.buyTick', 'buyTick')
      .addSelect('display.sellTick', 'sellTick')
      .addSelect('display.matchPrice', 'price')
      .addSelect('display.matchQuantity', 'quantity')
      .addSelect('display.closedPrice', 'closedPrice')
      .addSelect('display.stockType', 'stockType')
      .addSelect('display.priceLimit', 'priceLimit')
      .where('display.stockId = :stockId', { stockId })
      .orderBy('display.createdTime', 'ASC')
      .getRawMany();

    let defaultFirstOrderBuy = null;
    let defaultFirstOrderSell = null;
    const sortedResult = result.reduce<Record<string, IChartReduceOutput>>(
      (p, chartReduce: IChartReduceInput) => {
        const {
          price,
          quantity,
          createdTime,
          buyTick: _buyTick,
          sellTick: _sellTick,
          closedPrice,
          priceLimit,
          stockType,
        } = chartReduce;

        const { numTickRange } = getTickRange(
          closedPrice,
          priceLimit,
          stockType,
        );
        const buyTick: number[] = JSON.parse(_buyTick);
        const sellTick: number[] = JSON.parse(_sellTick);
        let firstOrderBuy = null;
        let firstOrderSell = null;
        numTickRange.forEach((innerPrice, index) => {
          if (firstOrderBuy === null && buyTick[index] !== 0)
            firstOrderBuy = innerPrice;
          if (sellTick[index] !== 0) firstOrderSell = innerPrice;
        });
        if (!p[createdTime]) {
          p[createdTime] = {
            quantity,
            lowest: price,
            highest: price,
            open: price,
            close: price,
            firstOrderBuy,
            firstOrderSell,
          };
        } else {
          p[createdTime].close = price;
          if (price > p[createdTime].highest) p[createdTime].highest = price;
          if (price < p[createdTime].lowest) p[createdTime].lowest = price;
          p[createdTime].quantity += quantity;
          if (firstOrderBuy !== null)
            p[createdTime].firstOrderBuy = firstOrderBuy;
          if (firstOrderSell !== null)
            p[createdTime].firstOrderSell = firstOrderSell;
        }

        if (p[createdTime].firstOrderBuy === null)
          p[createdTime].firstOrderBuy = defaultFirstOrderBuy;
        else defaultFirstOrderBuy = p[createdTime].firstOrderBuy;

        if (p[createdTime].firstOrderSell === null)
          p[createdTime].firstOrderSell = defaultFirstOrderSell;
        else defaultFirstOrderSell = p[createdTime].firstOrderSell;
        return p;
      },
      {},
    );
    return Object.entries(sortedResult).map(([key, value]) => {
      return {
        ...value,
        createdTime: key,
        firstOrderBuy: value.firstOrderBuy,
        firstOrderSell: value.firstOrderSell,
      };
    });
  }

  public async getFrequentData({
    createdTime,
    stockId,
    dateFormat,
  }: IFrequentDataQuery) {
    const queryBuilder = this.displayRepository.createQueryBuilder('display');
    // select
    if (!isNaN(dateFormat)) {
      queryBuilder.select(
        `DATE_FORMAT(display.createdTime,'${getDateFormatString(dateFormat)}')`,
        'createdTime',
      );
    } else {
      queryBuilder.select('display.createdTime', 'createdTime');
    }
    queryBuilder.addSelect('display.id', 'id');
    queryBuilder.addSelect('display.buyTick', 'buyTick');
    queryBuilder.addSelect('display.closedPrice', 'closedPrice');
    queryBuilder.addSelect('display.marketBuyQuantity', 'marketBuyQuantity');
    queryBuilder.addSelect('display.marketSellQuantity', 'marketSellQuantity');
    queryBuilder.addSelect('display.matchPrice', 'matchPrice');
    queryBuilder.addSelect('display.matchQuantity', 'matchQuantity');
    queryBuilder.addSelect('display.sellTick', 'sellTick');
    queryBuilder.addSelect('display.stockId', 'stockId');
    queryBuilder.addSelect('display.trendFlag', 'trendFlag');

    // where
    queryBuilder.where('display.stockId = :stockId', { stockId });
    if (createdTime) {
      const { max, min } = createdTime;
      if (max) queryBuilder.andWhere('display.createdTime < :max', { max });
      if (min) queryBuilder.andWhere('display.createdTime >= :min', { min });
    }
    queryBuilder.orderBy('createdTime', 'ASC');

    const displays = await queryBuilder.getRawMany<IDisplaySchema>();
    return await Promise.all(
      displays.map((display) => this.transferDisplayToReturnType(display)),
    );
  }

  public transferDisplayToReturnType = async (
    displaySchema?: Omit<IDisplaySchema, 'id' | 'createdTime'>,
  ) => {
    if (!displaySchema) return null;
    const {
      buyTick: buyTickJson,
      sellTick: sellTickJson,
      closedPrice,
      priceLimit,
      stockType,
      ...data
    } = displaySchema;
    const buyTick = JSON.parse(buyTickJson) as number[];
    const sellTick = JSON.parse(sellTickJson) as number[];
    const { numTickRange: tickRange } = getTickRange(
      closedPrice,
      priceLimit,
      stockType,
    );
    let firstOrderBuyPrice = null;
    let firstOrderSellPrice = null;

    let currentPriceIndex: number;
    let fiveTickRange: number[] = [];
    const transferTickRange: ITickRange[] = tickRange.map((price, index) => {
      let marketBuyAdder = 0;
      let marketSellAdder = 0;
      if (price === data.matchPrice) {
        marketBuyAdder = data.marketBuyQuantity;
        marketSellAdder = data.marketSellQuantity;
        currentPriceIndex = index;
        // FALL
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
        } else if (buyTick[index] !== 0 && sellTick[index] === 0) {
          // RISE
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
        } else {
          if (displaySchema.trendFlag === TrendFlagEnum.FALL) {
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
          } else {
            // RISE and SPACE
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
      fiveTickRange: fiveTickRange.map((tickRangeIndex, index) => {
        let tickRangeValue: Partial<ITickRange> = transferTickRange[
          tickRangeIndex
        ]
          ? { ...transferTickRange[tickRangeIndex] }
          : undefined;

        if (!tickRangeValue) {
          tickRangeValue = {
            price: getTickAfterNTick(
              data.matchPrice,
              currentPriceIndex - tickRangeIndex,
              stockType,
            ),
            buyQuantity: 0,
            sellQuantity: 0,
          };
        }

        if (index < 5) {
          delete tickRangeValue.buyQuantity;
        } else {
          delete tickRangeValue.sellQuantity;
        }
        return tickRangeValue;
      }),
      firstOrderBuyPrice,
      firstOrderSellPrice,
    } as ITransferDisplay;
  };
}

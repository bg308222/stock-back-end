import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Stock } from 'src/common/entity/stock.entity';
import { OrderStatusEnum, StockTypeEnum } from 'src/common/enum';
import { Repository } from 'typeorm';
import { IDisplayInsert, ITickRange } from '../display/display.dto';
import { DisplayService } from '../display/display.service';
import { IMatchOrder } from '../order/order.dto';
import { OrderService } from '../order/order.service';
import { ITransactionInsert } from '../transaction/transaction.dto';
import { TransactionService } from '../transaction/transaction.service';
import { IMarketBook, StockMarket } from './match.helper';

export const getOrderQuantity = (orders: IMatchOrder[]) => {
  const quantity = orders.reduce<number>((p, order) => {
    p += order.quantity;
    return p;
  }, 0);
  return quantity;
};

export const getNextTick = (currentPrice: number, stockType: StockTypeEnum) => {
  switch (stockType) {
    case StockTypeEnum.ETF: {
      if (currentPrice < 50) return 0.01;
      else return 0.05;
    }
    case StockTypeEnum.WARRANT: {
      if (currentPrice < 5) return 0.01;
      else if (currentPrice < 10) return 0.05;
      else if (currentPrice < 50) return 0.1;
      else if (currentPrice < 100) return 0.5;
      else if (currentPrice < 500) return 1;
      else return 5;
    }
    default: {
      if (currentPrice < 10) return 0.01;
      else if (currentPrice < 50) return 0.05;
      else if (currentPrice < 100) return 0.1;
      else if (currentPrice < 500) return 0.5;
      else if (currentPrice < 1000) return 1;
      else return 5;
    }
  }
};

export const getTickAfterNTick = (
  currentPrice: number,
  n: number,
  stockType: StockTypeEnum,
) => {
  let tempPrice = currentPrice;
  if (n > 0) {
    for (let i = 0; i < n; i++) {
      tempPrice += getNextTick(tempPrice, stockType);
      tempPrice.toFixed(2);
    }
  } else if (n < 0) {
    for (let i = 0; i > n; i--) {
      tempPrice -= getNextTick(tempPrice, stockType);
      tempPrice.toFixed(2);
    }
  }
  return +tempPrice.toFixed(2);
};

export const getTickRange = (
  closedPrice: number,
  priceLimit: number,
  stockType: StockTypeEnum,
) => {
  const maxPrice = closedPrice * (1 + 0.01 * priceLimit);
  const minPrice = closedPrice * (1 - 0.01 * priceLimit);

  let minTick = closedPrice;
  while (getTickAfterNTick(minTick, -1, stockType) > minPrice) {
    minTick = getTickAfterNTick(minTick, -1, stockType);
  }
  let maxTick = closedPrice;
  while (getTickAfterNTick(maxTick, 1, stockType) < maxPrice) {
    maxTick = getTickAfterNTick(maxTick, 1, stockType);
  }

  const numTickRange: number[] = [];
  const tickRange: ITickRange[] = [];
  for (
    let currentTick = minTick;
    currentTick < maxTick;
    currentTick = getTickAfterNTick(currentTick, 1, stockType)
  ) {
    numTickRange.push(currentTick);
    tickRange.push({
      price: currentTick,
      buyQuantity: 0,
      sellQuantity: 0,
    });
  }
  return {
    tickRange: tickRange.reverse(),
    numTickRange: numTickRange.reverse(),
  };
};

export const getTickList = ({
  limitBuy,
  limitSell,
  marketBuy,
  marketSell,
  ...marketBook
}: IMarketBook) => {
  const { numTickRange: tickRange } = getTickRange(
    marketBook.stock.closedPrice,
    marketBook.stock.priceLimit,
    marketBook.stock.type,
  );

  const buyTick: number[] = [];
  const sellTick: number[] = [];
  tickRange.forEach((price) => {
    const limitBuyOrders = limitBuy.orders[price];
    buyTick.push(!limitBuyOrders ? 0 : getOrderQuantity(limitBuyOrders));

    const limitSellOrders = limitSell.orders[price];
    sellTick.push(!limitSellOrders ? 0 : getOrderQuantity(limitSellOrders));
  });
  const marketBuyQuantity = getOrderQuantity(marketBuy);
  const marketSellQuantity = getOrderQuantity(marketSell);

  return {
    tickRange,
    buyTick,
    sellTick,
    marketBuyQuantity,
    marketSellQuantity,
  };
};

@Injectable()
export class MatchService {
  constructor(
    private readonly transactionService: TransactionService,
    @Inject(forwardRef(() => DisplayService))
    private readonly displayService: DisplayService,
    private readonly orderService: OrderService,

    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
  ) {
    this.stockMarketList = {};
  }
  private stockMarketList: Record<string, StockMarket>;

  public async init() {
    const stocks = (await this.stockRepository.find({})).map(
      (stock) => stock.id,
    );
    if (true) {
      await Promise.all(
        stocks.map(async (id) => {
          if (id === '0050') return;
          if (id.startsWith('REPLAY')) {
            return this.stockRepository.delete(id);
          }
          return this.createMarket(id)
            .then(async () => {
              await this.displayService.findAndDelete({ stockId: id });
              await this.orderService.findAndDelete({ stockId: id });
            })
            .then(() => {
              this.insertDisplay(id.toString());
            });
        }),
      );
    }
  }

  public async createMarket(id: string, marketName?: string) {
    const stock = await this.stockRepository.findOne({ id });

    if (!stock) throw new BadRequestException("Stock doesn't exist");
    const target = marketName || stock.id;

    if (this.stockMarketList[target]) delete this.stockMarketList[target];
    this.stockMarketList[target] = new StockMarket(stock);
    return target;
  }

  public getMarketBook(marketName: string) {
    const marketBook = this.stockMarketList[marketName];
    if (marketBook) return marketBook.dumpMarketBook();
    else return undefined;
  }

  private getTransactionBody(
    transactions: ITransactionInsert[],
  ): ITransactionInsert[] {
    return transactions.filter((v) => {
      return true || v.investorId !== null;
    });
  }

  private getDisplayBody(marketName: string): IDisplayInsert {
    const marketBook = this.stockMarketList[marketName].dumpMarketBook();
    const { buyTick, sellTick, marketBuyQuantity, marketSellQuantity } =
      getTickList(marketBook);

    return {
      stockId: marketName,
      matchPrice: marketBook.stock.currentPrice,
      matchQuantity: marketBook.accumulatedQuantity,
      trendFlag: marketBook.trendFlag,
      buyTick: JSON.stringify(buyTick),
      sellTick: JSON.stringify(sellTick),
      closedPrice: marketBook.stock.closedPrice,
      priceLimit: marketBook.stock.priceLimit,
      stockType: marketBook.stock.type,
      marketBuyQuantity,
      marketSellQuantity,
    };
  }

  private async insertDisplay(marketName: string, createdTime?: Date) {
    await this.displayService.insert({
      ...this.getDisplayBody(marketName),
      createdTime,
    });
  }

  public async getDisplayReturnType(marketName: string) {
    return await this.displayService.transferDisplayToReturnType(
      this.getDisplayBody(marketName),
    );
  }

  public async dispatchOrder(order: IMatchOrder, _marketName?: string) {
    const marketName = _marketName || order.stockId.toString();

    if (!this.stockMarketList[marketName])
      await this.createMarket(order.stockId, marketName);

    if (true) {
      const { transactions, isCancelSuccessfully, isUpdateSuccessfully } =
        this.stockMarketList[marketName].doCallAuction(order);

      if (isCancelSuccessfully !== undefined) {
        if (isCancelSuccessfully === true) {
          if (_marketName === undefined)
            await this.insertDisplay(marketName, order.createdTime);
          return await this.getDisplayReturnType(marketName);
        }
        return false;
      } else if (isUpdateSuccessfully !== undefined) {
        if (isUpdateSuccessfully === true) {
          return true;
        }
        return false;
      } else {
        // Match successfully
        if (_marketName === undefined) {
          await this.insertDisplay(marketName, order.createdTime);

          if (order.createdTime === undefined && transactions.length !== 0) {
            const inserTransactions = transactions.filter((transaction) => {
              return true || transaction.investorId !== null;
            });

            if (inserTransactions.length !== 0)
              await this.transactionService.insert(
                this.getTransactionBody(transactions),
              );
          }
        }
        return await this.getDisplayReturnType(marketName);
      }
    } else {
      // this.stockMarketList[marketName].doContinuousTrading();
    }
  }

  public async runOrders(
    orders: IMatchOrder[],
    marketName: string,
    isReset: boolean,
  ) {
    for (const { id, ...order } of orders) {
      if (!isReset) {
        order.stockId = marketName;
        await this.orderService.insert({
          ...order,
          stockId: marketName,
          status: OrderStatusEnum.SUCCESS,
        });
        await this.dispatchOrder(order);
      } else {
        this.stockMarketList[marketName].doCallAuction(order);
      }
    }
    return this.stockMarketList[marketName].dumpMarketBook();
  }

  public async getReplayOrdersAndMarketBook(
    stockId: string,
    startTime?: string,
    replayTime?: string,
    endTime?: string,
    isReset = false,
  ) {
    const marketName = `REPLAY_${stockId}_${new Date()
      .getTime()
      .toString()}${Math.random().toFixed(2)}`;
    await this.createMarket(stockId, marketName);

    if (!isReset) {
      const {
        createdTime: skip1,
        updatedTime: skip2,
        ...stock
      } = await this.stockRepository.findOne({ id: stockId });
      await this.stockRepository.insert({ ...stock, id: marketName });

      if (replayTime) {
        const { content: beforeOrders } = await this.orderService.get({
          stockId,
          createdTime: { max: replayTime, min: startTime },
          order: { orderBy: 'createdTime', order: 'ASC' },
        });

        await this.runOrders(beforeOrders, marketName, isReset);
      }
    }

    const { content: orders } = await this.orderService.get({
      stockId,
      createdTime: replayTime
        ? { min: replayTime, max: endTime }
        : { min: startTime, max: endTime },
      order: { orderBy: 'createdTime', order: 'ASC' },
    });

    if (isReset === true) {
      await Promise.all([
        this.orderService.deleteOrderByIds(orders.map((order) => order.id)),
        this.displayService.findAndDelete({
          stockId,
          createdTime: replayTime ? { min: replayTime } : undefined,
        }),
      ]);
    }

    const marketBook = this.stockMarketList[marketName].dumpMarketBook();

    return {
      orders: orders.map(({ id, ...order }) => {
        return {
          ...order,
          stockId: isReset ? order.stockId : marketName,
        };
      }),
      marketBook,
      marketName,
    };
  }

  public async setMarketBook(
    stockId: string,
    marketBook: IMarketBook,
    marketName?: string,
    isAutoDisplay?: boolean,
  ) {
    const stock = await this.stockRepository.findOne({ id: stockId });

    const target = marketName || stockId;
    if (!this.stockMarketList[target]) {
      await this.createMarket(stockId, marketName);
    }
    this.stockMarketList[target].setMarketBook(stock, marketBook, true);
    if (!marketName) {
      if (isAutoDisplay == false) return true;
      await this.insertDisplay(stockId);
      return await this.getDisplayReturnType(stockId);
    }
    return await this.getDisplayReturnType(marketName);
  }

  public getCertainInvestorOrder(investorId: number, stockId: string) {
    const result =
      this.stockMarketList[stockId].getCertainInvestorOrder(investorId);
    return result;
  }
}

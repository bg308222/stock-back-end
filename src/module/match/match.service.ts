import { BadRequestException, Injectable } from '@nestjs/common';
import { IDisplayInsert, ITickRange } from '../display/display.dto';
import { DisplayService } from '../display/display.service';
import { IMatchOrder } from '../order/order.dto';
import { OrderService } from '../order/order.service';
import { StockService } from '../stock/stock.service';
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

export const getNextTick = (currentPrice: number) => {
  if (currentPrice < 5) return 0.01;
  else if (currentPrice < 10) return 0.05;
  else if (currentPrice < 50) return 0.1;
  else if (currentPrice < 100) return 0.5;
  else if (currentPrice < 500) return 1;
  else return 5;
};

export const getTickAfterNTick = (currentPrice: number, n: number) => {
  let tempPrice = currentPrice;
  if (n > 0) {
    for (let i = 0; i < n; i++) {
      tempPrice += getNextTick(tempPrice);
    }
  } else if (n < 0) {
    for (let i = 0; i > n; i--) {
      tempPrice -= getNextTick(tempPrice);
    }
  }
  return tempPrice;
};

export const getTickRange = (closedPrice: number, priceLimit: number) => {
  const maxPrice = closedPrice * (1 + 0.01 * priceLimit);
  const minPrice = closedPrice * (1 - 0.01 * priceLimit);

  let minTick = closedPrice;
  while (minTick - getNextTick(minTick) > minPrice)
    minTick -= getNextTick(minTick);
  let maxTick = closedPrice;
  while (maxTick + getNextTick(maxTick) < maxPrice)
    maxTick += getNextTick(maxTick);

  const numTickRange: number[] = [];
  const tickRange: ITickRange[] = [];
  for (
    let currentTick = maxTick;
    currentTick >= minTick;
    currentTick -= getNextTick(currentTick)
  ) {
    numTickRange.push(currentTick);
    tickRange.push({
      price: currentTick,
      buyQuantity: 0,
      sellQuantity: 0,
    });
  }
  return {
    tickRange,
    numTickRange,
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
    private readonly displayService: DisplayService,
    private readonly stockService: StockService,
    private readonly orderService: OrderService,
  ) {
    this.stockMarketList = {};
  }
  private stockMarketList: Record<string, StockMarket>;

  public async init() {
    const { content } = await this.stockService.get({});
    const stocks = content.map((stock) => stock.id);
    await Promise.all(
      stocks.map(async (id) => {
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

  public async createMarket(id: number, marketName?: string) {
    const {
      content: [stock],
    } = await this.stockService.get({ id });
    if (!stock) throw new BadRequestException("Stock doesn't exist");
    const target = marketName || stock.id;
    let marketBook: IMarketBook = undefined;
    if (stock.virtualOrderContainer && stock.virtualOrderContainer.marketBook) {
      marketBook = JSON.parse(stock.virtualOrderContainer.marketBook);
    }

    if (this.stockMarketList[target]) delete this.stockMarketList[target];
    this.stockMarketList[target] = new StockMarket(stock, marketBook);
    return target;
  }

  public getMarketBook(marketName: string) {
    return this.stockMarketList[marketName].dumpMarketBook();
  }

  private getTransactionBody(
    transactions: ITransactionInsert[],
  ): ITransactionInsert[] {
    return transactions.filter((v) => {
      return v.investorId !== 0;
    });
  }

  private getDisplayBody(marketName: string): IDisplayInsert {
    const marketBook = this.stockMarketList[marketName].dumpMarketBook();
    const { buyTick, sellTick, marketBuyQuantity, marketSellQuantity } =
      getTickList(marketBook);

    return {
      stockId: marketBook.stock.id,
      matchPrice: marketBook.stock.currentPrice,
      matchQuantity: marketBook.accumulatedQuantity,
      trendFlag: marketBook.trendFlag,
      buyTick: JSON.stringify(buyTick),
      sellTick: JSON.stringify(sellTick),
      closedPrice: marketBook.stock.closedPrice,
      marketBuyQuantity,
      marketSellQuantity,
    };
  }

  private async insertDisplay(marketName: string) {
    await this.displayService.insert({
      ...this.getDisplayBody(marketName),
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
          if (_marketName) return await this.getDisplayReturnType(marketName);
          await this.insertDisplay(marketName);
          return true;
        }
        return false;
      } else if (isUpdateSuccessfully !== undefined) {
        if (isUpdateSuccessfully === true) {
          return true;
        }
        return false;
      } else {
        // Match successfully
        if (_marketName) {
          return await this.getDisplayReturnType(marketName);
        }

        await this.insertDisplay(marketName);

        if (transactions.length !== 0) {
          const inserTransactions = transactions.filter((transaction) => {
            return transaction.investorId !== null;
          });

          if (inserTransactions.length !== 0)
            await this.transactionService.insert(
              this.getTransactionBody(transactions),
            );
        }
        return true;
      }
    } else {
      // this.stockMarketList[marketName].doContinuousTrading();
    }
  }

  public runOrders(orders: IMatchOrder[], marketName: string) {
    for (const order of orders) {
      this.stockMarketList[marketName].doCallAuction(order);
    }
    return this.stockMarketList[marketName].dumpMarketBook();
  }

  public async getReplayOrdersAndMarketBook(
    stockId: number,
    createdTime?: string,
    isReset = false,
  ) {
    const marketName = `REPLAY_${new Date()
      .getTime()
      .toString()}${Math.random().toFixed(2)}`;
    await this.createMarket(stockId, marketName);

    if (createdTime) {
      const { content: beforeOrders } = await this.orderService.get({
        stockId,
        createdTime: { max: createdTime },
      });
      this.runOrders(beforeOrders, marketName);
    }

    const { content: orders } = await this.orderService.get({
      createdTime: createdTime ? { min: createdTime } : undefined,
      order: { orderBy: 'createdTime', order: 'ASC' },
    });

    if (isReset === true) {
      await Promise.all([
        this.orderService.deleteOrderByIds(orders.map((order) => order.id)),
        this.displayService.findAndDelete({
          stockId,
          createdTime: createdTime ? { min: createdTime } : undefined,
        }),
      ]);
    }

    const marketBook = this.stockMarketList[marketName].dumpMarketBook();

    return {
      orders: orders.map(({ id, createdTime, ...order }) => {
        if (isReset) {
          return {
            ...order,
          };
        }
        return {
          ...order,
          marketName,
        };
      }),
      marketBook,
      marketName,
    };
  }

  public async setMarketBook(
    stockId: number,
    marketBook: IMarketBook,
    marketName?: string,
  ) {
    const {
      content: [stock],
    } = await this.stockService.get({ id: stockId });

    const target = marketName || stockId;
    if (!this.stockMarketList[target])
      await this.createMarket(stockId, marketName);
    this.stockMarketList[target].setMarketBook(stock, marketBook);
    if (!marketName) {
      await this.insertDisplay(stockId.toString());
      return true;
    }
    return await await this.getDisplayReturnType(marketName);
  }
}

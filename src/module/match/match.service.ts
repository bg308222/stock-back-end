import { Injectable } from '@nestjs/common';
import { TransactionStatusEnum } from 'src/common/enum';
import { IDisplayInsert, ITickRange } from '../display/display.dto';
import { DisplayService } from '../display/display.service';
import { IOrderSchema } from '../order/order.dto';
import { OrderService } from '../order/order.service';
import { StockService } from '../stock/stock.service';
import { ITransactionInsert } from '../transaction/transaction.dto';
import { TransactionService } from '../transaction/transaction.service';
import { IMarketBook, StockMarket } from './match.helper';

export const getOrderQuantity = (orders: IOrderSchema[]) => {
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

export const getTickRange = (closedPrice: number) => {
  const maxPrice = closedPrice * 1.1;
  const minPrice = closedPrice * 0.9;

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

  private async createMarket(id: number, marketId?: number) {
    const {
      content: [stock],
    } = await this.stockService.get({ id });
    this.stockMarketList[marketId || stock.id] = new StockMarket(stock);
  }

  private stockMarketList: Record<string, StockMarket>;

  private getDisplayBody(marketBook: IMarketBook): IDisplayInsert {
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

  private getTransactionBody(
    transactions: ITransactionInsert[],
  ): ITransactionInsert[] {
    const sortedObject = transactions.reduce<
      Record<string, ITransactionInsert[]>
    >((p, transaction) => {
      if (!p[transaction.orderId]) p[transaction.orderId] = [];
      p[transaction.orderId].push(transaction);
      return p;
    }, {});

    const sortedArray = Object.values(sortedObject).map<ITransactionInsert>(
      (transactionArray) => {
        if (transactionArray.length === 1) return transactionArray[0];
        const mergeTransaction = transactionArray.reduce<
          Pick<ITransactionInsert, 'status' | 'quantity' | 'price'>
        >(
          (p, { status, quantity, price }) => {
            if (status === TransactionStatusEnum.FULL)
              p.status = TransactionStatusEnum.FULL;
            p.quantity += quantity;
            p.price += price * quantity;
            return p;
          },
          { status: TransactionStatusEnum.PARTIAL, quantity: 0, price: 0 },
        );
        return {
          ...transactionArray[0],
          ...mergeTransaction,
          price: mergeTransaction.price / mergeTransaction.quantity,
        };
      },
    );

    return sortedArray;
  }

  private async insertDisplay(stockId: number) {
    const marketBook = this.stockMarketList[stockId].dumpMarketBook();
    await this.displayService.insert({
      ...this.getDisplayBody(marketBook),
    });
  }

  public async dispatchOrder(order: IOrderSchema, isWriteDb = true) {
    if (!this.stockMarketList[order.stockId])
      await this.createMarket(order.stockId);

    //TODO Recognize when to doCallAuction or doContinuousTrading
    if (true) {
      const { transactions, isCancelSuccessfully, isUpdateSuccessfully } =
        this.stockMarketList[order.stockId].doCallAuction(order);

      if (isCancelSuccessfully !== undefined) {
        if (isCancelSuccessfully === true) {
          if (isWriteDb) await this.insertDisplay(order.stockId);
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
        if (isWriteDb) await this.insertDisplay(order.stockId);

        if (transactions.length !== 0) {
          if (isWriteDb)
            await this.transactionService.insert(
              this.getTransactionBody(transactions),
            );
        }
      }
    } else {
      // this.stockMarketList[order.stockId].doContinuousTrading();
    }
    return true;
  }

  public async getReplayOrdersAndMarketBook(
    stockId: number,
    createdTime?: string,
  ) {
    const marketId = new Date().getTime();
    await this.createMarket(stockId, marketId);

    if (createdTime) {
      const { content: beforeOrders } = await this.orderService.get({
        createdTime: { max: createdTime },
      });
      for (const order of beforeOrders) {
        this.stockMarketList[marketId].doCallAuction(order);
      }
    }

    const { content: orders } = await this.orderService.get({
      createdTime: createdTime ? { min: createdTime } : undefined,
      order: { orderBy: 'createdTime', order: 'ASC' },
    });
    const marketBook = this.stockMarketList[marketId].dumpMarketBook();

    delete this.stockMarketList[marketId];

    return {
      orders,
      marketBook,
    };
  }

  public async setMarketBook(stockId: number, marketBook: IMarketBook) {
    const {
      content: [stock],
    } = await this.stockService.get({ id: stockId });
    this.stockMarketList[stockId].setMarketBook(stock, marketBook);
    await this.insertDisplay(stock.id);
    return true;
  }
}

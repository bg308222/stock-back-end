import { BadRequestException, Injectable } from '@nestjs/common';
import { TransactionStatusEnum } from 'src/common/enum';
import { IDisplayInsert, ITickRange } from '../display/display.dto';
import { DisplayService } from '../display/display.service';
import { IOrderSchema } from '../order/order.dto';
import { ITransactionInsert } from '../transaction/transaction.dto';
import { TransactionService } from '../transaction/transaction.service';
import { IMarketBook, IMarketInformation, StockMarket } from './match.helper';

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

//只有@get /display/tickRange 需要拿ITickRange[] 其他都拿number[]
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
    marketBook.marketInformation.closedPrice,
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
  ) {
    this.stockMarketList = {};
  }

  private stockMarketList: Record<string, StockMarket>;

  private getDisplayBody(marketBook: IMarketBook): IDisplayInsert {
    const {
      tickRange,
      buyTick,
      sellTick,
      marketBuyQuantity,
      marketSellQuantity,
    } = getTickList(marketBook);

    return {
      stockId: marketBook.marketInformation.stockId,
      matchPrice: marketBook.currentPrice,
      matchQuantity: marketBook.accumulatedQuantity,
      buyTick: JSON.stringify(buyTick),
      sellTick: JSON.stringify(sellTick),
      tickRange: JSON.stringify(tickRange),
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
    await this.displayService.insert(this.getDisplayBody(marketBook));
  }

  public async dispatchOrder(order: IOrderSchema) {
    if (!this.stockMarketList[order.stockId]) {
      // TODO Dynamic stock market information
      // db find stock
      this.stockMarketList[order.stockId] = new StockMarket(
        {
          stockId: order.stockId,
          closedPrice: 100,
        },
        100,
      );
    }

    //TODO Recognize when to doCallAuction or doContinuousTrading
    if (true) {
      const { transactions, isCancelSuccessfully, isUpdateSuccessfully } =
        this.stockMarketList[order.stockId].doCallAuction(order);

      if (isCancelSuccessfully !== undefined) {
        if (isCancelSuccessfully === true) {
          await this.insertDisplay(order.stockId);
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
        await this.insertDisplay(order.stockId);

        if (transactions.length !== 0) {
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

  public setMarketInformation(
    stockId: number,
    marketInformation: Partial<IMarketInformation>,
  ) {
    if (!this.stockMarketList[stockId]) {
      throw new BadRequestException("This stock market doesn't exist");
    } else {
      this.stockMarketList[stockId].setMarketInformation(marketInformation);
    }
  }
}

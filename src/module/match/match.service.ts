import { BadRequestException, Injectable } from '@nestjs/common';
import { TransactionStatusEnum, UpperLowerLimitEnum } from 'src/common/enum';
import { IDisplayInsert } from '../display/display.dto';
import { DisplayService } from '../display/display.service';
import { IOrderSchema } from '../order/order.dto';
import { ITransactionInsert } from '../transaction/transaction.dto';
import { TransactionService } from '../transaction/transaction.service';
import { IMarketBook, IMarketInformation, StockMarket } from './match.helper';

export const getNextTick = (currentPrice: number) => {
  if (currentPrice < 5) return 0.01;
  else if (currentPrice < 10) return 0.05;
  else if (currentPrice < 50) return 0.1;
  else if (currentPrice < 100) return 0.5;
  else if (currentPrice < 500) return 1;
  else return 5;
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

  const tickRange: number[] = [];

  for (
    let currentTick = maxTick;
    currentTick >= minTick;
    currentTick -= getNextTick(currentTick)
  ) {
    tickRange.push(currentTick);
  }

  return tickRange;
};

export const getTickList = (
  tickRange: number[],
  buyOrders: Record<string, IOrderSchema[]>,
  sellOrders: Record<string, IOrderSchema[]>,
) => {
  const buyFiveTick: number[] = [];
  const sellFiveTick: number[] = [];
  tickRange.forEach((currentTick) => {
    const limitBuyOrders = buyOrders[currentTick];
    buyFiveTick.push(
      !limitBuyOrders
        ? 0
        : limitBuyOrders.reduce<number>((p, order) => {
            p += order.quantity;
            return p;
          }, 0),
    );

    const limitSellOrders = sellOrders[currentTick];
    sellFiveTick.push(
      !limitSellOrders
        ? 0
        : limitSellOrders.reduce<number>((p, order) => {
            p += order.quantity;
            return p;
          }, 0),
    );
  });

  return { tickRange, buyFiveTick, sellFiveTick };
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
    const maxPrice = marketBook.marketInformation.closedPrice * 1.1;
    const minPrice = marketBook.marketInformation.closedPrice * 0.9;

    // ---
    let buyUpperLowerLimit: UpperLowerLimitEnum = UpperLowerLimitEnum.SPACE,
      sellUpperLowerLimit: UpperLowerLimitEnum = UpperLowerLimitEnum.SPACE;

    if (
      marketBook.currentPrice + getNextTick(marketBook.currentPrice) >
      maxPrice
    ) {
      buyUpperLowerLimit = UpperLowerLimitEnum.LIMIT_UP;
      sellUpperLowerLimit = UpperLowerLimitEnum.LIMIT_UP;
    }

    if (
      marketBook.currentPrice - getNextTick(marketBook.currentPrice) <
      minPrice
    ) {
      buyUpperLowerLimit = UpperLowerLimitEnum.LIMIT_DOWN;
      sellUpperLowerLimit = UpperLowerLimitEnum.LIMIT_DOWN;
    }

    // ---
    const { tickRange, buyFiveTick, sellFiveTick } = getTickList(
      getTickRange(marketBook.marketInformation.closedPrice),
      marketBook.limitBuy.orders,
      marketBook.limitSell.orders,
    );

    return {
      stockId: marketBook.marketInformation.stockId,
      matchPrice: marketBook.currentPrice,
      matchQuantity: marketBook.accumulatedQuantity,
      buyTickSize: marketBook.limitBuy.getNonEmptyOrderSize(),
      buyUpperLowerLimit,
      buyFiveTick: JSON.stringify(buyFiveTick),
      sellTickSize: marketBook.limitSell.getNonEmptyOrderSize(),
      sellUpperLowerLimit,
      sellFiveTick: JSON.stringify(sellFiveTick),
      tickRange: JSON.stringify(tickRange),
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

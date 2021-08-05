import {
  MethodEnum,
  PriceTypeEnum,
  TimeRestrictiomEnum,
  TransactionStatusEnum,
} from 'src/common/enum';
import { IOrderSchema } from '../order/order.dto';
import { ITransactionBody } from '../transaction/transaction.dto';

export interface IMarketInformation {
  stockId: number;
  // openedPricet: number;
  // highestPricet: number;
  closedPrice: number;
  // lowestPricet: number
}

export interface IMarketBook {
  marketBuy: IOrderSchema[];
  marketSell: IOrderSchema[];
  limitBuy: LimitBook;
  limitSell: LimitBook;
  currentPrice: number;
  accumulatedQuantity: number;
  marketInformation: IMarketInformation;
}

interface IDoCallAuctionResponse {
  transactions: ITransactionBody[];
  cancelInformation?: {
    orderId: number;
  };
  updateInformation?: {
    orderId: number;
  };
}

class LimitBook {
  constructor(initialLimitBook?: LimitBook) {
    if (initialLimitBook) {
      this.orders = initialLimitBook.orders;
      this.firstOrderPrice = initialLimitBook.firstOrderPrice;
    } else {
      this.orders = {};
      this.firstOrderPrice = null;
    }
  }

  public orders: Record<string, IOrderSchema[]>;
  public firstOrderPrice: number;

  public popFirstOrder(price: number) {
    this.orders[price] = this.orders[price].slice(1);
  }

  public getNonEmptyOrderSize() {
    return Object.entries(this.orders).filter(([, orders]) => {
      return orders.length !== 0;
    }).length;
  }

  public adaptHighestLowestPrice(type: 'Buy' | 'Sell') {
    const sortedOrderArray = Object.entries(this.orders)
      .filter(([, orders]) => {
        return orders.length !== 0;
      })
      .sort(([priceA], [priceB]) => {
        return parseInt(priceA, 10) - parseInt(priceB, 10);
      });

    if (sortedOrderArray.length === 0) {
      this.firstOrderPrice = null;
    } else {
      if (type === 'Buy') {
        this.firstOrderPrice = parseInt(
          sortedOrderArray[sortedOrderArray.length - 1][0],
          10,
        );
      } else {
        this.firstOrderPrice = parseInt(sortedOrderArray[0][0], 10);
      }
    }
  }
}

export class StockMarket {
  constructor(marketInformation: IMarketInformation, currentPrice: number) {
    this.marketBook = {
      marketBuy: [],
      marketSell: [],
      limitBuy: new LimitBook(),
      limitSell: new LimitBook(),
      currentPrice,
      marketInformation,
      accumulatedQuantity: 0,
    };
  }

  public dumpMarketBook() {
    return this.marketBook;
  }

  private marketBook: IMarketBook;

  private popFirstOrder(order: IOrderSchema, method: 'Sell' | 'Buy') {
    if (order.priceType === PriceTypeEnum.MARKET) {
      this.marketBook[`market${method}`] =
        this.marketBook[`market${method}`].slice(1);
    }
    if (order.priceType === PriceTypeEnum.LIMIT) {
      this.marketBook[`limit${method}`].popFirstOrder(order.price);
    }
  }

  private transferOrderToTransaction(
    { id, createdTime, orderId, quantity: q, price: p, ...order }: IOrderSchema,
    status: TransactionStatusEnum,
    quantity: number,
    price: number,
  ): ITransactionBody {
    return { ...order, orderId: id, status, quantity, price };
  }

  public setMarketInformation(marketInformation: Partial<IMarketInformation>) {
    this.marketBook.marketInformation = {
      ...this.marketBook.marketInformation,
      ...marketInformation,
    };
  }

  public doCallAuction(order: IOrderSchema): IDoCallAuctionResponse {
    const returnResponse: IDoCallAuctionResponse = {
      transactions: [],
    };
    this.marketBook.accumulatedQuantity = 0;
    const originMarketBook = JSON.stringify(this.marketBook);
    let isNeverTransaction = true;

    // TODO 1 Check order method
    if (order.method === MethodEnum.CANCEL) {
      return returnResponse;
    }
    if (order.method === MethodEnum.UPDATE) {
      return returnResponse;
    }

    // 2 Classification
    const currentSideMethod = order.method === MethodEnum.BUY ? 'Buy' : 'Sell';
    const inverseSideMethod = order.method === MethodEnum.BUY ? 'Sell' : 'Buy';
    if (order.priceType === PriceTypeEnum.MARKET) {
      //Market buy
      if (this.marketBook[`market${currentSideMethod}`].push(order) !== 1)
        return returnResponse;
    }

    if (order.priceType === PriceTypeEnum.LIMIT) {
      //Limit buy
      if (!this.marketBook[`limit${currentSideMethod}`].orders[order.price])
        this.marketBook[`limit${currentSideMethod}`].orders[order.price] = [];
      if (
        this.marketBook[`limit${currentSideMethod}`].orders[order.price].push(
          order,
        ) !== 1
      )
        return returnResponse;
    }

    this.marketBook[`limit${currentSideMethod}`].adaptHighestLowestPrice(
      currentSideMethod,
    );
    this.marketBook[`limit${inverseSideMethod}`].adaptHighestLowestPrice(
      inverseSideMethod,
    );

    // 3 Match and transaction
    while (order.quantity !== 0) {
      //Choose inverse side order
      let inverseSideOrder: IOrderSchema =
        this.marketBook[`limit${inverseSideMethod}`].firstOrderPrice === null
          ? null
          : this.marketBook[`limit${inverseSideMethod}`].orders[
              this.marketBook[`limit${inverseSideMethod}`].firstOrderPrice
            ][0];
      if (this.marketBook[`market${inverseSideMethod}`].length !== 0) {
        inverseSideOrder = this.marketBook[`market${inverseSideMethod}`][0];
        if (inverseSideMethod === 'Buy') {
          inverseSideOrder.price = Math.max(
            this.marketBook.currentPrice,
            this.marketBook.limitBuy.firstOrderPrice,
            this.marketBook.limitSell.firstOrderPrice,
          );
        } else {
          inverseSideOrder.price = Math.min(
            this.marketBook.currentPrice || Number.MAX_VALUE,
            this.marketBook.limitBuy.firstOrderPrice || Number.MAX_VALUE,
            this.marketBook.limitSell.firstOrderPrice || Number.MAX_VALUE,
          );
        }
      }

      //Can not match
      if (!inverseSideOrder) break;

      //Transfer current side market price
      if (order.priceType === PriceTypeEnum.MARKET) {
        if (currentSideMethod === 'Buy') {
          order.price = Math.max(
            this.marketBook.currentPrice,
            this.marketBook.limitBuy.firstOrderPrice,
            this.marketBook.limitSell.firstOrderPrice,
          );
        } else {
          order.price = Math.min(
            this.marketBook.currentPrice || Number.MAX_VALUE,
            this.marketBook.limitBuy.firstOrderPrice || Number.MAX_VALUE,
            this.marketBook.limitSell.firstOrderPrice || Number.MAX_VALUE,
          );
        }
      }

      if (
        (order.method === MethodEnum.BUY &&
          order.price >= inverseSideOrder.price) ||
        (order.method === MethodEnum.SELL &&
          order.price <= inverseSideOrder.price)
      ) {
        //Match
        if (order.quantity > inverseSideOrder.quantity) {
          //Inverse side order is finished.
          returnResponse.transactions.push(
            this.transferOrderToTransaction(
              order,
              TransactionStatusEnum.PARTIAL,
              inverseSideOrder.quantity,
              this.marketBook.currentPrice,
            ),
            this.transferOrderToTransaction(
              inverseSideOrder,
              TransactionStatusEnum.FULL,
              inverseSideOrder.quantity,
              this.marketBook.currentPrice,
            ),
          );

          this.marketBook.currentPrice = inverseSideOrder.price;
          this.marketBook.accumulatedQuantity += inverseSideOrder.quantity;
          isNeverTransaction = false;
          order.quantity -= inverseSideOrder.quantity;
          this.popFirstOrder(inverseSideOrder, inverseSideMethod);
        } else if (order.quantity < inverseSideOrder.quantity) {
          //Current side order is finished
          if (inverseSideOrder.timeRestriction === TimeRestrictiomEnum.FOK)
            this.popFirstOrder(inverseSideOrder, inverseSideMethod);
          if (
            inverseSideOrder.timeRestriction === TimeRestrictiomEnum.IOC ||
            inverseSideOrder.timeRestriction === TimeRestrictiomEnum.ROD
          ) {
            returnResponse.transactions.push(
              this.transferOrderToTransaction(
                order,
                TransactionStatusEnum.FULL,
                order.quantity,
                this.marketBook.currentPrice,
              ),
              this.transferOrderToTransaction(
                inverseSideOrder,
                TransactionStatusEnum.PARTIAL,
                order.quantity,
                this.marketBook.currentPrice,
              ),
            );

            this.marketBook.currentPrice = inverseSideOrder.price;
            this.marketBook.accumulatedQuantity += order.quantity;
            isNeverTransaction = false;
            inverseSideOrder.quantity -= order.quantity;
            order.quantity = 0;
            this.popFirstOrder(order, currentSideMethod);

            if (inverseSideOrder.timeRestriction === TimeRestrictiomEnum.IOC)
              this.popFirstOrder(inverseSideOrder, inverseSideMethod);
          }
        } else {
          //Current and inverse side order are finished.
          returnResponse.transactions.push(
            this.transferOrderToTransaction(
              order,
              TransactionStatusEnum.FULL,
              order.quantity,
              this.marketBook.currentPrice,
            ),
            this.transferOrderToTransaction(
              inverseSideOrder,
              TransactionStatusEnum.FULL,
              order.quantity,
              this.marketBook.currentPrice,
            ),
          );

          this.marketBook.currentPrice = inverseSideOrder.price;
          this.marketBook.accumulatedQuantity += order.quantity;
          isNeverTransaction = false;
          order.quantity = 0;
          this.popFirstOrder(order, currentSideMethod);
          this.popFirstOrder(inverseSideOrder, inverseSideMethod);
        }
      } else {
        //Can not match
        break;
      }

      this.marketBook[`limit${currentSideMethod}`].adaptHighestLowestPrice(
        currentSideMethod,
      );
      this.marketBook[`limit${inverseSideMethod}`].adaptHighestLowestPrice(
        inverseSideMethod,
      );
    }

    // 4 Check is current side order finished
    if (order.quantity !== 0) {
      if (!isNeverTransaction) {
        if (order.timeRestriction === TimeRestrictiomEnum.FOK) {
          const recoveryMarketBook = JSON.parse(
            originMarketBook,
          ) as IMarketBook;
          this.marketBook = {
            ...recoveryMarketBook,
            limitBuy: new LimitBook(recoveryMarketBook.limitBuy),
            limitSell: new LimitBook(recoveryMarketBook.limitSell),
          };
          returnResponse.transactions = [];
        }
        if (order.timeRestriction === TimeRestrictiomEnum.IOC) {
          if (order.method === MethodEnum.BUY) {
            this.popFirstOrder(order, 'Buy');
          }
          if (order.method === MethodEnum.SELL) {
            this.popFirstOrder(order, 'Sell');
          }
        }
      }
    }

    this.marketBook[`limit${currentSideMethod}`].adaptHighestLowestPrice(
      currentSideMethod,
    );
    this.marketBook[`limit${inverseSideMethod}`].adaptHighestLowestPrice(
      inverseSideMethod,
    );
    return returnResponse;
  }

  public doContinuousTrading() {
    //
  }
}

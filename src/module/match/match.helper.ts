import {
  MethodEnum,
  PriceTypeEnum,
  TimeRestrictiomEnum,
  TransactionStatusEnum,
} from 'src/common/enum';
import { IOrderSchema } from '../order/order.dto';
import { ITransactionBody } from '../transaction/transaction.dto';

interface IMarketInformation {
  // openedPricet: number;
  // highestPricet: number;
  closedPrice: number;
  // lowestPricet: number
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
  constructor() {
    this.orders = {};
    this.firstOrderPrice = null;
  }

  public orders: Record<string, IOrderSchema[]>;
  public firstOrderPrice: number;

  public popFirstOrder(price: number) {
    this.orders[price] = this.orders[price].slice(1);
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
  constructor(
    private marketInformation: IMarketInformation,
    private currentPrice: number,
  ) {
    this.marketBook = {
      marketBuy: [],
      marketSell: [],
      limitBuy: new LimitBook(),
      limitSell: new LimitBook(),
    };
  }

  public dumpMarketInformation() {
    console.log(this.marketBook);
    // console.log('Current price: ', this.currentPrice);
  }

  private marketBook: {
    marketBuy: IOrderSchema[];
    marketSell: IOrderSchema[];
    limitBuy: LimitBook;
    limitSell: LimitBook;
  };

  private popFirstOrder(order: IOrderSchema, method: 'Sell' | 'Buy') {
    if (order.priceType === PriceTypeEnum.MARKET) {
      this.marketBook[`market${method}`] =
        this.marketBook[`market${method}`].slice(1);
    }
    if (order.priceType === PriceTypeEnum.LIMIT) {
      this.marketBook.limitSell.popFirstOrder(order.price);
    }
  }

  private transferOrderToTransaction(
    { id, createdTime, orderId, quantity: q, ...order }: IOrderSchema,
    status: TransactionStatusEnum,
    quantity: number,
  ): ITransactionBody {
    return { ...order, orderId: id, status, quantity };
  }

  public doCallAuction(order: IOrderSchema): IDoCallAuctionResponse {
    const returnResponse: IDoCallAuctionResponse = {
      transactions: [],
    };
    const originMarketBook = JSON.stringify(this.marketBook);
    const originCurrentPrice = this.currentPrice;
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

    // 3 Match and transaction
    while (order.quantity !== 0) {
      //Choose inverse side order
      this.marketBook[`limit${inverseSideMethod}`].adaptHighestLowestPrice(
        inverseSideMethod,
      );
      let inverseSideOrder: IOrderSchema =
        this.marketBook[`limit${inverseSideMethod}`].firstOrderPrice === null
          ? null
          : this.marketBook[`limit${inverseSideMethod}`].orders[
              this.marketBook[`limit${inverseSideMethod}`].firstOrderPrice
            ][0];
      if (this.marketBook.marketSell.length !== 0) {
        inverseSideOrder = this.marketBook.marketSell[0];
        inverseSideOrder.price = Math.min(
          this.currentPrice,
          this.marketBook.limitBuy.firstOrderPrice,
          this.marketBook.limitSell.firstOrderPrice,
        );
      }

      //Can not match
      if (!inverseSideOrder) break;

      //Transfer current side market price
      if ((order.priceType = PriceTypeEnum.MARKET)) {
        order.price = Math.max(
          this.currentPrice,
          this.marketBook.limitBuy.firstOrderPrice,
          this.marketBook.limitSell.firstOrderPrice,
        );
      }

      if (
        (order.method === MethodEnum.BUY &&
          order.price >= inverseSideOrder.price) ||
        (order.method === MethodEnum.SELL &&
          order.price <= inverseSideOrder.price)
      ) {
        //Match
        //Transaction
        if (order.quantity > inverseSideOrder.quantity) {
          //Inverse side order is finished.
          order.quantity -= inverseSideOrder.quantity;

          returnResponse.transactions.push(
            this.transferOrderToTransaction(
              order,
              TransactionStatusEnum.PARTIAL,
              inverseSideOrder.quantity,
            ),
          );
          returnResponse.transactions.push(
            this.transferOrderToTransaction(
              inverseSideOrder,
              TransactionStatusEnum.FULL,
              inverseSideOrder.quantity,
            ),
          );

          isNeverTransaction = false;
          this.currentPrice = inverseSideOrder.price;
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
              ),
            );
            returnResponse.transactions.push(
              this.transferOrderToTransaction(
                inverseSideOrder,
                TransactionStatusEnum.PARTIAL,
                order.quantity,
              ),
            );

            isNeverTransaction = false;
            this.currentPrice = inverseSideOrder.price;
            order.price = 0;
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
            ),
          );
          returnResponse.transactions.push(
            this.transferOrderToTransaction(
              inverseSideOrder,
              TransactionStatusEnum.FULL,
              order.quantity,
            ),
          );

          isNeverTransaction = false;
          this.currentPrice = inverseSideOrder.price;
          order.price = 0;
          this.popFirstOrder(order, currentSideMethod);
          this.popFirstOrder(inverseSideOrder, inverseSideMethod);
        }
      } else {
        //Can not match
        break;
      }
    }

    // 4 Check is current side order finished
    if (order.quantity !== 0) {
      if (!isNeverTransaction) {
        if (order.timeRestriction === TimeRestrictiomEnum.FOK) {
          this.marketBook = JSON.parse(originMarketBook);
          this.currentPrice = originCurrentPrice;
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
    return returnResponse;
  }

  public doContinuousTrading() {
    console.log(1);
  }
}

import {
  MethodEnum,
  PriceTypeEnum,
  SubMethodEnum,
  TimeRestrictiomEnum,
  TransactionStatusEnum,
  TrendFlagEnum,
} from 'src/common/enum';
import { IMatchOrder } from '../order/order.dto';
import { IStockSchema } from '../stock/stock.dto';
import { ITransactionInsert } from '../transaction/transaction.dto';

const debug = (message: any) => {
  if (0) console.log(message);
};
export interface IMarketBook {
  marketBuy: IMatchOrder[];
  marketSell: IMatchOrder[];
  limitBuy: LimitBook;
  limitSell: LimitBook;
  stock: IStockSchema;
  accumulatedQuantity: number;
  trendFlag: TrendFlagEnum;
}

interface IDoCallAuctionResponse {
  transactions: ITransactionInsert[];
  isCancelSuccessfully?: boolean;
  isUpdateSuccessfully?: boolean;
}

class LimitBook {
  constructor(initialLimitBook?: LimitBook) {
    if (initialLimitBook) {
      this.orders = initialLimitBook.orders;
      this.firstOrderPrice = initialLimitBook.firstOrderPrice;
      this.highestOrderPrice = initialLimitBook.highestOrderPrice;
      this.lowestOrderPrice = initialLimitBook.lowestOrderPrice;
    } else {
      this.orders = {};
      this.firstOrderPrice = null;
      this.highestOrderPrice = null;
      this.lowestOrderPrice = null;
    }
  }

  public orders: Record<string, IMatchOrder[]>;
  public firstOrderPrice: number;
  public highestOrderPrice: number;
  public lowestOrderPrice: number;

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
        return +priceA - +priceB;
      });

    if (sortedOrderArray.length === 0) {
      this.firstOrderPrice = null;
      this.highestOrderPrice = null;
      this.lowestOrderPrice = null;
    } else {
      this.highestOrderPrice =
        +sortedOrderArray[sortedOrderArray.length - 1][0];
      this.lowestOrderPrice = +sortedOrderArray[0][0];
      if (type === 'Buy') {
        this.firstOrderPrice = this.highestOrderPrice;
      } else {
        this.firstOrderPrice = this.lowestOrderPrice;
      }
    }
  }
}

export class StockMarket {
  constructor(stock: IStockSchema) {
    this.setMarketBook(stock);
  }

  public setMarketBook(stock: IStockSchema, marketBook?: IMarketBook) {
    if (marketBook) {
      this.marketBook = {
        ...marketBook,
        limitBuy: new LimitBook(marketBook.limitBuy),
        limitSell: new LimitBook(marketBook.limitSell),
        stock,
      };
    } else {
      this.marketBook = {
        marketBuy: [],
        marketSell: [],
        limitBuy: new LimitBook(),
        limitSell: new LimitBook(),
        accumulatedQuantity: 0,
        trendFlag: TrendFlagEnum.SPACE,
        stock,
      };
    }
    return true;
  }

  public dumpMarketBook() {
    return this.marketBook;
  }

  private marketBook: IMarketBook;

  private popFirstOrder(order: IMatchOrder, method: 'Sell' | 'Buy') {
    if (order.priceType === PriceTypeEnum.MARKET) {
      this.marketBook[`market${method}`] =
        this.marketBook[`market${method}`].slice(1);
    }
    if (order.priceType === PriceTypeEnum.LIMIT) {
      this.marketBook[`limit${method}`].popFirstOrder(order.price);
    }
  }

  private transferOrderToTransaction(
    { id, quantity: q, price: p, ...order }: IMatchOrder,
    status: TransactionStatusEnum,
    quantity: number,
    price: number,
  ): ITransactionInsert {
    return { ...order, orderId: id, status, quantity, price };
  }

  private updateTrendFlag(method: 'Sell' | 'Buy') {
    if (method === 'Sell') {
      this.marketBook.trendFlag = TrendFlagEnum.FALL;
    }
    if (method === 'Buy') {
      this.marketBook.trendFlag = TrendFlagEnum.RISE;
    }
  }

  public doCallAuction(order: IMatchOrder): IDoCallAuctionResponse {
    const returnResponse: IDoCallAuctionResponse = {
      transactions: [],
      isCancelSuccessfully: undefined,
      isUpdateSuccessfully: undefined,
    };
    const currentSideMethod = order.method === MethodEnum.BUY ? 'Buy' : 'Sell';
    const inverseSideMethod = order.method === MethodEnum.BUY ? 'Sell' : 'Buy';
    const originMarketBook = JSON.stringify(this.marketBook);
    let isNeverTransaction = true;

    this.marketBook.accumulatedQuantity = 0;

    debug('Cancel and Update');
    if (order.subMethod === SubMethodEnum.CANCEL) {
      debug('Cancel');
      returnResponse.isCancelSuccessfully = false;

      let targetOrderList: IMatchOrder[];
      if (order.priceType === PriceTypeEnum.LIMIT) {
        targetOrderList =
          this.marketBook[`limit${currentSideMethod}`].orders[order.price];
      } else if (order.priceType === PriceTypeEnum.MARKET) {
        targetOrderList = this.marketBook[`market${currentSideMethod}`];
      }
      if (targetOrderList) {
        const orderIndex = targetOrderList.findIndex(
          ({
            investorId,
            stockId,
            method,
            price,
            quantity,
            priceType,
            timeRestriction,
          }) => {
            if (
              investorId === order.investorId &&
              stockId === order.stockId &&
              method === order.method &&
              price === order.price &&
              quantity >= order.quantity &&
              priceType === order.priceType &&
              timeRestriction === order.timeRestriction
            )
              return true;
            return false;
          },
        );
        if (orderIndex !== -1) {
          debug('Cancel find order');
          const { quantity } = targetOrderList[orderIndex];
          if (order.quantity === quantity) {
            targetOrderList.splice(orderIndex, 1);
            returnResponse.isCancelSuccessfully = true;
          } else if (order.quantity < quantity) {
            targetOrderList[orderIndex].quantity -= order.quantity;
            returnResponse.isCancelSuccessfully = true;
          }
        }
      }
      return returnResponse;
    }
    if (order.subMethod === SubMethodEnum.UPDATE) {
      return returnResponse;
    }

    // 2 Classification
    debug('Classification start');
    if (order.priceType === PriceTypeEnum.MARKET) {
      //Market
      debug('Market ');
      if (this.marketBook[`market${currentSideMethod}`].push(order) !== 1)
        return returnResponse;
    }

    if (order.priceType === PriceTypeEnum.LIMIT) {
      //Limit
      debug('Limit ');
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
    debug('Match start');
    while (order.quantity !== 0) {
      //Choose inverse side order
      let inverseSideOrder: IMatchOrder =
        this.marketBook[`limit${inverseSideMethod}`].firstOrderPrice === null
          ? null
          : this.marketBook[`limit${inverseSideMethod}`].orders[
              this.marketBook[`limit${inverseSideMethod}`].firstOrderPrice
            ][0];
      if (this.marketBook[`market${inverseSideMethod}`].length !== 0) {
        inverseSideOrder = this.marketBook[`market${inverseSideMethod}`][0];
        if (inverseSideMethod === 'Buy') {
          inverseSideOrder.price = Math.max(
            this.marketBook.stock.currentPrice,
            this.marketBook.limitBuy.highestOrderPrice,
            this.marketBook.limitSell.highestOrderPrice,
          );
        } else {
          inverseSideOrder.price = Math.min(
            this.marketBook.stock.currentPrice || Number.MAX_VALUE,
            this.marketBook.limitBuy.lowestOrderPrice || Number.MAX_VALUE,
            this.marketBook.limitSell.lowestOrderPrice || Number.MAX_VALUE,
          );
        }
      }

      //Can not match
      if (!inverseSideOrder) break;

      //Transfer current side market price
      if (order.priceType === PriceTypeEnum.MARKET) {
        if (currentSideMethod === 'Buy') {
          order.price = Math.max(
            this.marketBook.stock.currentPrice,
            this.marketBook.limitBuy.highestOrderPrice,
            this.marketBook.limitSell.highestOrderPrice,
          );
        } else {
          order.price = Math.min(
            this.marketBook.stock.currentPrice || Number.MAX_VALUE,
            this.marketBook.limitBuy.lowestOrderPrice || Number.MAX_VALUE,
            this.marketBook.limitSell.lowestOrderPrice || Number.MAX_VALUE,
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
              this.marketBook.stock.currentPrice,
            ),
            this.transferOrderToTransaction(
              inverseSideOrder,
              TransactionStatusEnum.FULL,
              inverseSideOrder.quantity,
              this.marketBook.stock.currentPrice,
            ),
          );

          this.marketBook.stock.currentPrice = inverseSideOrder.price;
          this.marketBook.accumulatedQuantity += inverseSideOrder.quantity;
          this.updateTrendFlag(currentSideMethod);
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
                this.marketBook.stock.currentPrice,
              ),
              this.transferOrderToTransaction(
                inverseSideOrder,
                TransactionStatusEnum.PARTIAL,
                order.quantity,
                this.marketBook.stock.currentPrice,
              ),
            );

            this.marketBook.stock.currentPrice = inverseSideOrder.price;
            this.marketBook.accumulatedQuantity += order.quantity;
            this.updateTrendFlag(inverseSideMethod);
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
              this.marketBook.stock.currentPrice,
            ),
            this.transferOrderToTransaction(
              inverseSideOrder,
              TransactionStatusEnum.FULL,
              order.quantity,
              this.marketBook.stock.currentPrice,
            ),
          );

          this.marketBook.stock.currentPrice = inverseSideOrder.price;
          this.marketBook.accumulatedQuantity += order.quantity;
          this.updateTrendFlag(currentSideMethod);
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
    debug('Check start');
    if (order.quantity !== 0) {
      if (!isNeverTransaction) {
        if (order.timeRestriction === TimeRestrictiomEnum.FOK) {
          const recoveryMarketBook = JSON.parse(
            originMarketBook,
          ) as IMarketBook;
          this.setMarketBook(recoveryMarketBook.stock, recoveryMarketBook);
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

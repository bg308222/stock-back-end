import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/common/entity/order.entity';
import { Transaction } from 'src/common/entity/transaction.entity';
import { Repository } from 'typeorm';
import { IOrderSchema } from '../order/order.dto';
import { StockMarket } from './match.helper';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {
    this.stockMarketList = {};
  }

  private stockMarketList: Record<string, StockMarket>;
  public async dispatchOrder(order: IOrderSchema) {
    if (!this.stockMarketList[order.stockId]) {
      this.stockMarketList[order.stockId] = new StockMarket(
        {
          closedPrice: 150,
        },
        100,
      );
    }

    //TODO Recognize when to doCallAuction or doContinuousTrading
    if (true) {
      const result = this.stockMarketList[order.stockId].doCallAuction(order);
      this.stockMarketList[order.stockId].dumpMarketInformation();
      console.log(result);
    } else {
      this.stockMarketList[order.stockId].doContinuousTrading();
    }
    return 1;
  }
}

// function getTick(currentPrice: number) {
//   if (currentPrice < 5) return 0.01;
//   else if (currentPrice < 10) return 0.05;
//   else if (currentPrice < 50) return 0.1;
//   else if (currentPrice < 100) return 0.5;
//   else if (currentPrice < 500) return 1;
//   else return 5;
// }

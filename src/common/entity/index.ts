import { AvailableStock } from './availableStock.entity';
import { AvailableStockDate } from './availableStockDate.entity';
import { Display } from './display.entity';
import { Group } from './group.entity';
import { Investor } from './investor.entity';
import { Order } from './order.entity';
import { Permission } from './permission.entity';
import { RealDataFuturesDisplay } from './realDataFuturesDisplay.entity';
import { RealDataFuturesDisplayContent } from './realDataFuturesDisplayContent.entity';
import { RealDataFuturesOrder } from './realDataFuturesOrder.entity';
import { RealDataFuturesOrderContent } from './realDataFuturesOrderContent.entity';
import { RealDataFuturesTransaction } from './realDataFuturesTransaction.entity';
import { RealDataFuturesTransactionContent } from './realDataFuturesTransactionContent.entity';
import { RealDataStockDisplay } from './realDataStockDisplay.entity';
import { RealDataStockDisplayContent } from './realDataStockDisplayContent.entity';
import { RealDataStockOrder } from './realDataStockOrder.entity';
import { RealDataStockOrderContent } from './realDataStockOrderContent.entity';
import { RealDataStockTransaction } from './realDataStockTransaction.entity';
import { RealDataStockTransactionContent } from './realDataStockTransactionContent.entity';
import { Role } from './role.entity';
import { Stock } from './stock.entity';
import { Transaction } from './transaction.entity';
import { VirtualOrder } from './virtualOrder.entity';
import { VirtualOrderContainer } from './virtualOrderContainer.entity';

export const entities = [
  AvailableStock,
  AvailableStockDate,
  Investor,
  Order,
  Stock,
  Transaction,
  Display,
  VirtualOrder,
  VirtualOrderContainer,
  Group,
  RealDataStockOrder,
  RealDataStockOrderContent,
  RealDataStockDisplay,
  RealDataStockDisplayContent,
  RealDataStockTransaction,
  RealDataStockTransactionContent,
  RealDataFuturesOrder,
  RealDataFuturesOrderContent,
  RealDataFuturesDisplay,
  RealDataFuturesDisplayContent,
  RealDataFuturesTransaction,
  RealDataFuturesTransactionContent,
  Role,
  Permission,
];

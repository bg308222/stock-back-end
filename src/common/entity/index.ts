import { AvailableStock } from './availableStock.entity';
import { AvailableStockDate } from './availableStockDate.entity';
import { Display } from './display.entity';
import { Group } from './group.entity';
import { Investor } from './investor.entity';
import { Order } from './order.entity';
import { Permission } from './permission.entity';
import { RealDataDisplay } from './realDataDisplay.entity';
import { RealDataDisplayContent } from './realDataDisplayContent.entity';
import { RealDataOrder } from './realDataOrder.entity';
import { RealDataOrderContent } from './realDataOrderContent.entity';
import { RealDataTransaction } from './realDataTransaction.entity';
import { RealDataTransactionContent } from './realDataTransactionContent.entity';
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
  RealDataOrder,
  RealDataOrderContent,
  RealDataDisplay,
  RealDataDisplayContent,
  RealDataTransaction,
  RealDataTransactionContent,
  Role,
  Permission,
];

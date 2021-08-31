import {
  MethodEnum,
  PriceTypeEnum,
  TimeRestrictiomEnum,
  TransactionStatusEnum,
} from 'src/common/enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Investor } from './investor.entity';
import { Order } from './order.entity';
import { Stock } from './stock.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  investorId: number;
  @ManyToOne(() => Investor, { nullable: false, onDelete: 'CASCADE' })
  investor: Investor;

  @CreateDateColumn()
  createdTime: Date;

  @Column()
  stockId: string;
  @ManyToOne(() => Stock, { nullable: false, onDelete: 'CASCADE' })
  stock: Stock;

  @Column({ type: 'enum', enum: MethodEnum })
  method: number;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'enum', enum: PriceTypeEnum })
  priceType: number;

  @Column({ type: 'enum', enum: TimeRestrictiomEnum })
  timeRestriction: number;

  @Column()
  orderId: number;
  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  order: Order;

  @Column({ type: 'enum', enum: TransactionStatusEnum })
  status: number;
}

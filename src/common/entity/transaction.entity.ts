import {
  MethodEnum,
  PriceTypeEnum,
  TimeRestrictiomEnum,
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

  @ManyToOne(() => Investor, { nullable: false })
  investor: Investor;

  @CreateDateColumn()
  createdTime: Date;

  @ManyToOne(() => Stock, { nullable: false })
  stock: Stock;

  @Column({ type: 'enum', enum: MethodEnum })
  method: number;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'enum', enum: PriceTypeEnum })
  priceType: number;

  @Column({ type: 'enum', enum: TimeRestrictiomEnum })
  timeRestriction: number;

  @ManyToOne(() => Order)
  order: Order;
}

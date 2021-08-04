import {
  MethodEnum,
  PriceTypeEnum,
  TimeRestrictiomEnum,
} from 'src/common/enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Investor } from './investor.entity';
import { Stock } from './stock.entity';

@Entity()
export class Order {
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

  @OneToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'cancelOrderId' })
  cancelOrder: Order;
}

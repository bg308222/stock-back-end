import {
  MethodEnum,
  OrderStatusEnum,
  PriceTypeEnum,
  SubMethodEnum,
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
import { Stock } from './stock.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  investorId: number;
  @ManyToOne(() => Investor, { nullable: false, onDelete: 'CASCADE' })
  investor: Investor;

  @CreateDateColumn()
  createdTime: Date;

  @Column()
  stockId: number;
  @ManyToOne(() => Stock, { nullable: false, onDelete: 'CASCADE' })
  stock: Stock;

  @Column({ type: 'enum', enum: MethodEnum })
  method: number;

  @Column({ type: 'enum', enum: SubMethodEnum, nullable: true, default: null })
  subMethod: number;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'enum', enum: PriceTypeEnum })
  priceType: number;

  @Column({ type: 'enum', enum: TimeRestrictiomEnum })
  timeRestriction: number;

  @Column({ default: OrderStatusEnum.SUCCESS })
  status: number;
}

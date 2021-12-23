import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  MethodEnum,
  PriceTypeEnum,
  SubMethodEnum,
  TimeRestrictiomEnum,
} from '../enum';
import { RealDataStockOrder } from './realDataStockOrder.entity';

@Entity()
@Index(['stockId', 'createdTime'])
export class RealDataStockOrderContent {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  realDataOrderId: string;
  @ManyToOne(() => RealDataStockOrder, { onDelete: 'CASCADE', nullable: false })
  realDataOrder: RealDataStockOrder;

  @Column({ width: 6 })
  createdTime: Date;

  @Column({ type: 'varchar' })
  stockId: string;

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

  @Column({ type: 'varchar' })
  code: string;
}

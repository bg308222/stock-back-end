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
import { RealDataFuturesOrder } from './realDataFuturesOrder.entity';

@Entity()
@Index(['stockId', 'createdTime'])
export class RealDataFuturesOrderContent {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  realDataOrderId: string;
  @ManyToOne(() => RealDataFuturesOrder, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  realDataOrder: RealDataFuturesOrder;

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

import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RealDataFuturesTransaction } from './realDataFuturesTransaction.entity';

@Entity()
@Index(['stockId', 'createdTime'])
export class RealDataFuturesTransactionContent {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  realDataTransactionId: string;
  @ManyToOne(() => RealDataFuturesTransaction, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  realDataTransaction: RealDataFuturesTransaction;

  @Column({ width: 6 })
  createdTime: Date;

  @Column({ type: 'varchar' })
  stockId: string;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar' })
  @Index()
  code: string;
}

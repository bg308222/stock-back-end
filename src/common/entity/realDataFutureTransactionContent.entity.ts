import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RealDataFutureTransaction } from './realDataFutureTransaction.entity';

@Entity()
@Index(['stockId', 'createdTime'])
export class RealDataFutureTransactionContent {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  realDataTransactionId: string;
  @ManyToOne(() => RealDataFutureTransaction, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  realDataTransaction: RealDataFutureTransaction;

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

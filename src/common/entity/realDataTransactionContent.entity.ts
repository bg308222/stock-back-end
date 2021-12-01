import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RealDataTransaction } from './realDataTransaction.entity';

@Entity()
@Index(['stockId', 'createdTime'])
export class RealDataTransactionContent {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  realDataTransactionId: string;
  @ManyToOne(() => RealDataTransaction, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  realDataTransaction: RealDataTransaction;

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

import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RealDataStockTransaction } from './realDataStockTransaction.entity';

@Entity()
@Index(['stockId', 'createdTime'])
export class RealDataStockTransactionContent {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  realDataTransactionId: string;
  @ManyToOne(() => RealDataStockTransaction, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  realDataTransaction: RealDataStockTransaction;

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

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Stock } from './stock.entity';

@Entity()
export class Display {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdTime: Date;

  @Column()
  stockId: number;
  @ManyToOne(() => Stock, { nullable: false, onDelete: 'CASCADE' })
  stock: Stock;

  @Column({ type: 'float' })
  matchPrice: number;

  @Column({ type: 'int' })
  matchQuantity: number;

  @Column({ type: 'int' })
  marketBuyQuantity: number;

  @Column({ type: 'int' })
  marketSellQuantity: number;

  @Column({ type: 'longtext', default: '"[]"' })
  buyTick: string;

  @Column({ type: 'longtext', default: '"[]"' })
  sellTick: string;

  @Column({ type: 'float' })
  closedPrice: number;

  @Column({ type: 'int' })
  trendFlag: number;
}

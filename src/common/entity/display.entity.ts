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
  @ManyToOne(() => Stock, { nullable: false })
  stock: Stock;

  @Column({ type: 'float' })
  matchPrice: number;

  @Column({ type: 'int' })
  matchQuantity: number;

  @Column({ type: 'int' })
  marketBuyQuantity: number;

  @Column({ type: 'int' })
  marketSellQuantity: number;

  @Column({ type: 'json', default: '"[]"' })
  buyTick: string;

  @Column({ type: 'json', default: '"[]"' })
  sellTick: string;

  @Column({ type: 'json', default: '"[]"' })
  tickRange: string;
}

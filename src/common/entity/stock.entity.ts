import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StockTypeEnum } from '../enum';
import { Group } from './group.entity';

@Entity()
export class Stock {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'float' })
  closedPrice: number;

  @Column({ type: 'int' })
  priceLimit: number;

  @Column({ type: 'float' })
  currentPrice: number;

  @CreateDateColumn()
  createdTime: Date;

  @UpdateDateColumn()
  updatedTime: Date;

  @Column({ type: 'int', default: StockTypeEnum.STOCK })
  type: number;

  @ManyToMany(() => Group, (group) => group.stocks, { onDelete: 'CASCADE' })
  groups: Group[];
}

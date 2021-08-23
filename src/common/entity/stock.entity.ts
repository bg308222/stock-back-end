import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Group } from './group.entity';

@Entity()
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ nullable: true })
  virtualOrderContainerId: number;

  @ManyToMany(() => Group, (group) => group.stocks)
  groups: Group[];
}

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Investor } from './investor.entity';
import { Stock } from './stock.entity';
import { VirtualOrder } from './virtualOrder.entity';

@Entity()
export class VirtualOrderContainer {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column({ type: 'varchar' })
  // name: string;

  @Column()
  stockId: number;
  @ManyToOne(() => Stock, { nullable: false, onDelete: 'CASCADE' })
  stock: Stock;

  @Column()
  investorId: number;
  @ManyToOne(() => Investor, { nullable: false, onDelete: 'CASCADE' })
  investor: Investor;

  @OneToMany(
    () => VirtualOrder,
    (virtualOrder) => virtualOrder.virtualOrderContainer,
    { eager: true },
  )
  orders: VirtualOrder[];

  @CreateDateColumn()
  createdTime: Date;

  @UpdateDateColumn()
  updatedTime: Date;
}

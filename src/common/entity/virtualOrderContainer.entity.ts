import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Stock } from './stock.entity';
import { VirtualOrder } from './virtualOrder.entity';

@Entity()
export class VirtualOrderContainer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  stockId: number;
  @ManyToOne(() => Stock, { nullable: false, onDelete: 'CASCADE' })
  stock: Stock;

  @OneToMany(
    () => VirtualOrder,
    (virtualOrder) => virtualOrder.virtualOrderContainer,
    { eager: true },
  )
  orders: VirtualOrder[];

  @Column({ type: 'longtext', default: null, nullable: true })
  marketBook: string;

  @CreateDateColumn()
  createdTime: Date;

  @UpdateDateColumn()
  updatedTime: Date;
}

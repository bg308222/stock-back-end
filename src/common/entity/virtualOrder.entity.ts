import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  MethodEnum,
  PriceTypeEnum,
  SubMethodEnum,
  TimeRestrictiomEnum,
} from '../enum';
import { VirtualOrderContainer } from './virtualOrderContainer.entity';

@Entity()
export class VirtualOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdTime: Date;

  @Column({ type: 'enum', enum: MethodEnum })
  method: number;

  @Column({ type: 'enum', enum: SubMethodEnum, nullable: true, default: null })
  subMethod: number;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'enum', enum: PriceTypeEnum })
  priceType: number;

  @Column({ type: 'enum', enum: TimeRestrictiomEnum })
  timeRestriction: number;

  @Column()
  virtualOrderContainerId: number;
  @ManyToOne(
    () => VirtualOrderContainer,
    (virtualOrderContainer) => virtualOrderContainer.orders,
    { onDelete: 'CASCADE' },
  )
  virtualOrderContainer: VirtualOrderContainer;
}

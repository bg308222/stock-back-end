import { UpperLowerLimitEnum } from 'src/common/enum';
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

  @Column({ type: 'int' })
  matchPrice: number;

  @Column({ type: 'int' })
  matchQuantity: number;

  @Column({ type: 'int' })
  buyTickSize: number;

  @Column({ type: 'enum', enum: UpperLowerLimitEnum })
  buyUpperLowerLimit: number;

  @Column({ type: 'json', default: '"[]"' })
  buyFiveTick: string;

  @Column({ type: 'int' })
  sellTickSize: number;

  @Column({ type: 'enum', enum: UpperLowerLimitEnum })
  sellUpperLowerLimit: number;

  @Column({ type: 'json', default: '"[]"' })
  sellFiveTick: string;

  @Column({ type: 'json', default: '"[]"' })
  tickRange: string;
}

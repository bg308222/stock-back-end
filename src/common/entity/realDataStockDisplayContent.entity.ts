import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { RealDataStockDisplay } from './realDataStockDisplay.entity';

@Entity()
@Index(['sym', 'createdTime'])
export class RealDataStockDisplayContent {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  realDataDisplayId: string;
  @ManyToOne(() => RealDataStockDisplay, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  realDataDisplay: RealDataStockDisplay;

  @Column({ type: 'varchar' })
  sym: string;

  @Column({ width: 6 })
  createdTime: Date;

  @Column({ type: 'float', nullable: true })
  mthpx: number;

  @Column({ type: 'int', nullable: true })
  mthsz: number;

  @Column({ type: 'int' })
  bsz: number;

  @Column({ type: 'float' })
  b1px: number;
  @Column({ type: 'int' })
  b1sz: number;

  @Column({ type: 'float' })
  b2px: number;
  @Column({ type: 'int' })
  b2sz: number;

  @Column({ type: 'float' })
  b3px: number;
  @Column({ type: 'int' })
  b3sz: number;

  @Column({ type: 'float' })
  b4px: number;
  @Column({ type: 'int' })
  b4sz: number;

  @Column({ type: 'float' })
  b5px: number;
  @Column({ type: 'int' })
  b5sz: number;

  @Column({ type: 'int' })
  asz: number;

  @Column({ type: 'float' })
  a1px: number;
  @Column({ type: 'int' })
  a1sz: number;

  @Column({ type: 'float' })
  a2px: number;
  @Column({ type: 'int' })
  a2sz: number;

  @Column({ type: 'float' })
  a3px: number;
  @Column({ type: 'int' })
  a3sz: number;

  @Column({ type: 'float' })
  a4px: number;
  @Column({ type: 'int' })
  a4sz: number;

  @Column({ type: 'float' })
  a5px: number;
  @Column({ type: 'int' })
  a5sz: number;
}

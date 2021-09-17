import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RealDataDisplay } from './realDataDisplay.entity';

@Entity()
export class RealDataDisplayContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  realDataDisplayId: string;
  @ManyToOne(() => RealDataDisplay, { onDelete: 'CASCADE', nullable: false })
  realDataDisplay: RealDataDisplay;

  @Column({ type: 'varchar', length: 6 })
  sym: string;

  @Column({ width: 6 })
  createdTime: Date;

  @Column({ type: 'float' })
  mthpx: number;

  @Column({ type: 'int' })
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

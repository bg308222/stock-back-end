import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class RealDataFutureDisplay {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'int', default: 0 })
  isFinished: number;

  @CreateDateColumn()
  createdTime: Date;

  @UpdateDateColumn()
  updatedTime: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Investor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  account: string;

  @Column({ type: 'varchar' })
  password: string;

  @CreateDateColumn()
  createdTime: Date;

  @UpdateDateColumn()
  updatedTime: Date;

  @Column({ type: 'datetime', nullable: true })
  expiredTime: Date;
}

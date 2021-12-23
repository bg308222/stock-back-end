import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class Investor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  account: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'int', default: 5 })
  restApiTime: number;

  @Column({ nullable: true })
  token: string;

  @Column()
  roleId: number;
  @ManyToOne(() => Role, { nullable: false, cascade: true })
  role: Role;

  @CreateDateColumn()
  createdTime: Date;

  @UpdateDateColumn()
  updatedTime: Date;

  @Column({ type: 'datetime', nullable: true })
  expiredTime: Date;
}

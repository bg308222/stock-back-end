import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  //TODO relation
  @Column({ nullable: true })
  virtualOrderContainerId: number;
}

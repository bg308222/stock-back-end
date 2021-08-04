import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Investor {
  @PrimaryGeneratedColumn()
  id: number;
}

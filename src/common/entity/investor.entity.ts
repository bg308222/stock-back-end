import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Investor {
  constructor(id: number) {
    this.id = id;
  }

  @PrimaryGeneratedColumn()
  id: number;
}

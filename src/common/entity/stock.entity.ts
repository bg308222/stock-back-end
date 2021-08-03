import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Stock {
  constructor(id: number) {
    this.id = id;
  }

  @PrimaryGeneratedColumn()
  id: number;
}

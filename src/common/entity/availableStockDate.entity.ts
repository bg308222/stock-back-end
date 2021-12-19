import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class AvailableStockDate {
  @PrimaryColumn()
  id: string;

  @PrimaryColumn()
  date: Date;

  @Column()
  type: string;
}

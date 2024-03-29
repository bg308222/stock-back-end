import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class AvailableStockDate {
  @PrimaryColumn()
  id: string;

  @PrimaryColumn()
  date: Date;

  @PrimaryColumn()
  type: string;
}

import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class AvailableFuturesDate {
  @PrimaryColumn()
  id: string;

  @PrimaryColumn()
  date: Date;

  @PrimaryColumn()
  type: string;
}

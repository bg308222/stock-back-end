import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class AvailableFutureDate {
  @PrimaryColumn()
  id: string;

  @PrimaryColumn()
  date: Date;

  @PrimaryColumn()
  type: string;
}

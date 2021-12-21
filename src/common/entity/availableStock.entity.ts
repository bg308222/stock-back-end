import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class AvailableStock {
  @PrimaryColumn()
  id: string;

  @PrimaryColumn()
  type: string;
}

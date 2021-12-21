import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class AvailableFuture {
  @PrimaryColumn()
  id: string;

  @PrimaryColumn()
  type: string;
}

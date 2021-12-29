import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class AvailableFutures {
  @PrimaryColumn()
  id: string;

  @PrimaryColumn()
  type: string;
}

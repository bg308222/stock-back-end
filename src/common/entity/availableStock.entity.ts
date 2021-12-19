import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class AvailableStock {
  @PrimaryColumn()
  id: string;

  @Column()
  type: string;
}

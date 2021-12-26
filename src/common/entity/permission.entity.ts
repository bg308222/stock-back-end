import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class Permission {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'int' })
  order: number;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}

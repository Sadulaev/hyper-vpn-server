import { UserRole } from 'enums/roles.enum';
import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Client } from './client.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn()
  id: number;

  @Column({ nullable: true, default: null })
  name: string | null;

  @Column({ nullable: true, default: null })
  phone: string | null;

  @Column({ nullable: true, default: null })
  organization: string | null;

  @Column({ default: UserRole.Unknown })
  role: UserRole;

  @Column({ default: false })
  isBanned: boolean;

  @OneToMany(() => Client, (client) => client.creator)
  clients: Client[];
}

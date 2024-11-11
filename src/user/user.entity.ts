import { UserRole } from 'src/enums/roles.enum';
import { Entity, Column, PrimaryColumn } from 'typeorm';

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
}

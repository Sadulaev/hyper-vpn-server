import { UserRole } from 'src/enums/roles.enum';
import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryColumn()
    id: number;

    @Column({ nullable: true, default: null })
    realname: string | null;

    @Column()
    username: string;

    @Column({ default: 'user' })
    role: UserRole;
}
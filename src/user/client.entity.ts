import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Plan } from "./plan.entity";
import { User } from "./user.entity";

@Entity()
export class Client {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    fullName: string;

    @Column({type: 'timestamptz', nullable: false})
    birthDate: Date;

    @Column({default: null, nullable: true})
    phone: string | null;

    @Column({type: 'json', default: null, nullable: true})
    images: string | null;

    @OneToMany(() => Plan, (plan) => plan.clientId)
    plans: Plan[];

    @ManyToOne(() => User, (user) => user.clients, {nullable: true})
    creator: User | null;
}
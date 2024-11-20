import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";
import { Plan } from "src/plan/plan.entity";

@Entity()
export class Client {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    fullName: string;

    @Column({type: 'date', nullable: false})
    birthDate: Date;

    @Column({default: null, nullable: true})
    phone: string | null;

    @Column({type: 'json', default: null, nullable: true})
    images: string | null;

    @ManyToOne(() => User, (user) => user.clients, {nullable: true})
    user: User | null;

    @OneToMany(() => Plan, (plan) => plan.client, {nullable: true})
    plans: Plan[];
}
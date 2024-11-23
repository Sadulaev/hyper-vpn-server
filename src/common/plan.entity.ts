import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Client } from "./client.entity";
import { User } from "src/user/user.entity";
import { PaymentStatus } from "enums/payment-status.enum";

@Entity()
export class Plan {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    title: string;

    @Column({nullable: false})
    description: string;

    @Column({nullable: false})
    sum: number;

    @Column({type: 'date', nullable: true, default: null})
    startDate: Date | null;

    @Column({type: 'date', nullable: true, default: null})
    endDate: Date | null;

    @Column({nullable: false, default: PaymentStatus.Active})
    paymentStatus: PaymentStatus;

    @ManyToOne(() => Client, (client) => client.plans)
    client: Client;

    @ManyToOne(() => User, (user) => user.plans)
    user: User;
}
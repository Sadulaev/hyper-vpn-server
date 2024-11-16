import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Client } from "./client.entity";

@Entity()
export class Plan {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    title: string;

    @Column({nullable: false})
    description: string;

    @Column({type: 'timestamptz', nullable: true, default: null})
    startDate: Date | null;

    @Column({type: 'timestamptz', nullable: true, default: null})
    endDate: Date | null;

    @Column({type: 'json', nullable: false})
    records: string;

    @ManyToOne(() => Client, (client) => client.plans)
    clientId: Client;
}
// src/payments/entities/payment-session.entity.ts
import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired';

@Entity('tg_users')
export class TgUsers {
  @PrimaryColumn({ type: 'bigint'})
  id: number; // хранить как текст/bigint (tg id может быть большим)

  @Column({ type: 'varchar', nullable: true })
  firstName: string;

  @Column({ type: 'varchar', nullable: true })
  userName: string;
}
// src/payments/entities/payment-session.entity.ts
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired';

@Entity('payment_sessions')
@Index('idx_payment_sessions_status', ['status'])
@Index('idx_payment_sessions_expires_at', ['expiresAt'])
export class PaymentSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // наш orderId (uuid), положим в shp_order

  @Column({ type: 'bigint', unique: true })
  invId!: string; // числовой InvId, Robokassa вернёт его в колбэке

  @Column({ type: 'bigint' })
  telegramId!: string; // хранить как текст/bigint (tg id может быть большим)

  @Column({ type: 'varchar', length: 16, default: 'pending' })
  status!: PaymentStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;
}
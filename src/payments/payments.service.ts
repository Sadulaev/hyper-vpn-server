// src/payments/payments.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { PaymentSession } from './entities/payment-session.entity';
import * as crypto from 'crypto';
import { addMonthsPlusOneDay } from 'utils/addMonthPlusOneDay';

type ShpMap = Record<string, string>;

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentSession)
    private readonly repo: Repository<PaymentSession>,
  ) {}

  async createSession(params: { telegramId: string; ttlMinutes?: number, period?: number, firstName: string, userName: string }) {
    const invId = Date.now().toString(); // можно заменить на sequence
    const expiresAt =
      params.ttlMinutes ? new Date(Date.now() + params.ttlMinutes * 60_000) : null;

      const keyExpiresAt = addMonthsPlusOneDay(params.period);

    const session = this.repo.create({
      invId,
      telegramId: params.telegramId,
      period: params.period || 1,
      firstName: params.firstName || "",
      userName: params.userName || "",
      status: 'pending',
      expiresAt,
      keyExpiresAt
    });
    const saved = await this.repo.save(session);
    return saved; // id = orderId (uuid), invId = числовой
  }

  async markPaidAndAddKey(invId: string, vlessKey: string) {
    const s = await this.repo.findOne({ where: { invId } });
    if (!s) return null;
    if (s.status === 'paid') return s; // идемпотентно
    s.status = 'paid';
    s.vlessKey = vlessKey;
    return this.repo.save(s);
  }

  async findOrderByInvId(invId: string) {
    return this.repo.findOne({ where: { invId } });
  }

  async getPaidAndNotExpiredKeysByTgId(tgId: string) {
    const now = new Date();
    const result = await this.repo.find({
      where: {
        telegramId: tgId,
        status: 'paid',
        keyExpiresAt: MoreThan(now),
      },
    });

    return result.filter(s => !!s.vlessKey)
  }

  async cleanupExpired() {
    await this.repo.update(
      { status: 'pending', expiresAt: LessThan(new Date()) },
      { status: 'expired' },
    );
  }
}

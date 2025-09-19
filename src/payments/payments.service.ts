// src/payments/payments.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
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

  private buildSignatureStr(outSum: string, invId: string, secret: string, shp: ShpMap) {
    // base: OutSum:InvId:Secret + :shp_key=value (по ключам в лексикографическом порядке)
    const keys = Object.keys(shp).sort();
    const tail = keys.map(k => `${k}=${shp[k]}`).join(':');
    return tail ? `${outSum}:${invId}:${secret}:${tail}` : `${outSum}:${invId}:${secret}`;
  }

  verifySignature(outSum: string, invId: string, given: string, secret: string, shp: ShpMap) {
    const s = this.buildSignatureStr(outSum, invId, secret, shp);
    const calc = crypto.createHash('md5').update(s).digest('hex').toUpperCase();
    return calc === (given || '').toUpperCase();
  }

  async createSession(params: { telegramId: string; ttlMinutes?: number, period?: number, firstName: string, userName: string }) {
    const invId = Date.now().toString(); // можно заменить на sequence
    const expiresAt = addMonthsPlusOneDay(params.period);

    const session = this.repo.create({
      invId,
      telegramId: params.telegramId,
      period: params.period || 1,
      firstName: params.firstName || "",
      userName: params.userName || "",
      status: 'pending',
      expiresAt,
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

  async cleanupExpired() {
    await this.repo.update(
      { status: 'pending', expiresAt: LessThan(new Date()) },
      { status: 'expired' },
    );
  }
}

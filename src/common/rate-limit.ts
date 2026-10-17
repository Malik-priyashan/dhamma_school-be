import { createHash } from 'crypto';
import { HttpException, HttpStatus } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

export function requestIp(request: Request): string {
  return request.ip || request.socket.remoteAddress || 'unknown';
}

export async function enforceRateLimit(
  prisma: PrismaService,
  scope: string,
  identity: string,
  limit: number,
  windowMs: number,
): Promise<void> {
  const now = Date.now();
  const bucket = Math.floor(now / windowMs);
  const digest = createHash('sha256')
    .update(`${scope}:${identity.trim().toLowerCase()}`)
    .digest('hex');
  const key = `${scope}:${digest}:${bucket}`;
  const record = await prisma.rateLimitEntry.upsert({
    where: { key },
    create: { key, count: 1, expiresAt: new Date((bucket + 1) * windowMs) },
    update: { count: { increment: 1 } },
  });

  if (record.count > limit) {
    throw new HttpException('Too many requests. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
  }

  // Expired buckets can be deleted without affecting the active counter.
  if (Math.random() < 0.01) {
    void prisma.rateLimitEntry.deleteMany({
      where: { expiresAt: { lt: new Date(now - 60_000) } },
    }).catch(() => undefined);
  }
}

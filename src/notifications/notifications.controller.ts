import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { Client } from 'pg';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

function directDatabaseUrl(): string {
  const configured =
    process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
  if (!configured) {
    throw new Error('Database connection is not configured');
  }
  const url = new URL(configured);
  url.hostname = url.hostname.replace('-pooler.', '.');
  return url.toString();
}

@Controller('notifications')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class NotificationsController {
  @Get('stream')
  async stream(@Res() response: Response): Promise<void> {
    const client = new Client({ connectionString: directDatabaseUrl() });
    response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    response.setHeader('Cache-Control', 'private, no-cache, no-transform');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('X-Accel-Buffering', 'no');
    response.flushHeaders();

    let closed = false;
    let connected = false;
    const heartbeat = setInterval(() => {
      if (!response.writableEnded) response.write(': heartbeat\n\n');
    }, 25_000);
    const expiry = setTimeout(() => close(), 240_000);
    const close = () => {
      if (closed) return;
      closed = true;
      clearInterval(heartbeat);
      clearTimeout(expiry);
      if (connected) void client.end().catch(() => undefined);
      if (!response.writableEnded) response.end();
    };
    response.on('close', close);
    client.on('notification', () => {
      if (!closed && !response.writableEnded) {
        response.write('event: change\ndata: {}\n\n');
      }
    });
    client.on('error', close);
    client.on('end', close);

    try {
      await client.connect();
      connected = true;
      if (closed) {
        void client.end().catch(() => undefined);
        return;
      }
      await client.query('LISTEN admin_notifications');
      if (!closed) response.write('event: ready\ndata: {}\n\n');
    } catch {
      close();
    }
  }
}

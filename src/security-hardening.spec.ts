import { ForbiddenException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { MarksController } from './marks/marks.controller';
import { MarksService } from './marks/marks.service';
import { AuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { ROLES_KEY } from './auth/decorators/roles.decorator';
import { StudentRequestController } from './student-request/student-request.controller';
import { PrefectController } from './prefect/prefect.controller';
import { AnnouncingController } from './announcing/announcing.controller';

const studentRequest = { user: { sub: 'user-1', role: 'STUDENT' } } as Request & {
  user: { sub: string; role: string };
};

describe('backend authorization boundaries', () => {
  it('requires guards for marks and restricts student records', async () => {
    const service = {
      findOwnedStudentIds: jest.fn().mockResolvedValue(['student-1']),
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ student: { userId: 'other-user' } }),
    };
    const controller = new MarksController(service as unknown as MarksService);
    expect(Reflect.getMetadata(GUARDS_METADATA, MarksController)).toEqual([AuthGuard, RolesGuard]);
    expect(Reflect.getMetadata(ROLES_KEY, MarksController.prototype.create)).toBeUndefined();
    expect(Reflect.getMetadata(ROLES_KEY, MarksController.prototype.findAll)).toContain('STUDENT');

    await expect(controller.findAll(studentRequest, 'student-2')).rejects.toThrow(ForbiddenException);
    expect(service.findAll).not.toHaveBeenCalled();
    await controller.findAll(studentRequest, 'student-1');
    expect(service.findAll).toHaveBeenCalledWith('student-1', undefined, undefined, ['student-1']);
    await expect(controller.findOne(studentRequest, 'mark-1')).rejects.toThrow(ForbiddenException);
  });

  it('keeps student application lists and decisions admin only', () => {
    expect(Reflect.getMetadata(ROLES_KEY, StudentRequestController.prototype.findAllRequests)).toEqual(['ADMIN']);
    expect(Reflect.getMetadata(ROLES_KEY, PrefectController.prototype.getAll)).toEqual(['ADMIN']);
    expect(Reflect.getMetadata(ROLES_KEY, PrefectController.prototype.update)).toEqual(['ADMIN']);
    expect(Reflect.getMetadata(ROLES_KEY, AnnouncingController.prototype.findAll)).toEqual(['ADMIN']);
    expect(Reflect.getMetadata(ROLES_KEY, AnnouncingController.prototype.update)).toEqual(['ADMIN']);
  });

  it('uses the current database role and rejects inactive accounts', async () => {
    const jwt = { verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-1', role: 'ADMIN' }) };
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue({ id: 'user-1', role: 'STUDENT', isActive: true }) } };
    const guard = new AuthGuard(jwt as never, prisma as never);
    const request = { cookies: { accessToken: 'signed-token' }, headers: {} } as unknown as Request & {
      user?: { sub: string; role: string };
    };
    const context = { switchToHttp: () => ({ getRequest: () => request }) } as ExecutionContext;
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({ sub: 'user-1', role: 'STUDENT' });
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'ADMIN', isActive: false });
    await expect(guard.canActivate(context)).rejects.toThrow('Invalid or expired token');
  });
});

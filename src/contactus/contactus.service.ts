import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ContactUsStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeFormTextFields } from '../common/text-normalizer';
import { CreateContactUsDto } from './dto/create-contactus.dto';
import { UpdateContactUsDto } from './dto/update-contactus.dto';

@Injectable()
export class ContactUsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContactUsDto, userId?: string, isAdmin = false) {
    const studentId = dto.studentId?.trim();
    const targetUserId = isAdmin
      ? dto.replyToUserId?.trim() || userId
      : userId;
    if (studentId && !isAdmin) {
      const ownedStudent = userId && await this.prisma.student.findFirst({
        where: { id: studentId, userId },
        select: { id: true },
      });
      if (!ownedStudent) throw new ForbiddenException('Student record is not yours');
    }
    // validate provided user and student IDs to avoid Prisma foreign key errors
    if (targetUserId) {
      const userExists = await this.prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true },
      });
      if (!userExists) {
        throw new NotFoundException('Target user not found');
      }
    }

    if (studentId) {
      const studentExists = await this.prisma.student.findUnique({
        where: { id: studentId },
        select: { id: true },
      });
      if (!studentExists) {
        throw new NotFoundException('Target student not found');
      }
    }
    const data: Prisma.ContactUsCreateInput = {
      name: normalizeFormTextFields(dto.name),
      message: normalizeFormTextFields(dto.message),
      senderName: isAdmin
        ? 'Admin'
        : /^admin(istrator)?$/i.test(dto.senderName.trim())
          ? 'Guest'
          : normalizeFormTextFields(dto.senderName),
      status: 'NOT_READ',
      ...(targetUserId ? { user: { connect: { id: targetUserId } } } : {}),
      ...(studentId ? { student: { connect: { id: studentId } } } : {}),
    };

    try {
      return await this.prisma.contactUs.create({
        data,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          student: {
            select: {
              id: true,
              fullNameWithSurname: true,
              nameWithInitials: true,
            },
          },
        },
      });
    } catch (err) {
      // surface a clearer message for unexpected Prisma errors
      throw new BadRequestException('Failed to create contact message');
    }
  }

  async findAll() {
    return this.prisma.contactUs.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            fullNameWithSurname: true,
            nameWithInitials: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findByUser(userId: string) {
    return this.prisma.contactUs.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            fullNameWithSurname: true,
            nameWithInitials: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const contactUs = await this.prisma.contactUs.findUnique({ where: { id } });
    if (!contactUs) {
      throw new NotFoundException('Contact message not found');
    }
    return contactUs;
  }

  async update(id: string, dto: UpdateContactUsDto) {
    const existing = await this.prisma.contactUs.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Contact message not found');
    }

    const studentId = dto.studentId?.trim();
    const data: Prisma.ContactUsUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = normalizeFormTextFields(dto.name);
    }

    if (dto.message !== undefined) {
      data.message = normalizeFormTextFields(dto.message);
    }

    if (dto.senderName !== undefined) {
      data.senderName = normalizeFormTextFields(dto.senderName);
    }

    if (dto.status !== undefined) {
      data.status = dto.status;
    }

    const targetUserId = dto.replyToUserId?.trim() || dto.userId?.trim();
    if (targetUserId) {
      const userExists = await this.prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true },
      });
      if (!userExists) {
        throw new NotFoundException('Target user not found');
      }

      data.user = { connect: { id: targetUserId } };
    }

    if (studentId) {
      const studentExists = await this.prisma.student.findUnique({
        where: { id: studentId },
        select: { id: true },
      });
      if (!studentExists) {
        throw new NotFoundException('Target student not found');
      }

      data.student = { connect: { id: studentId } };
    }

    return this.prisma.contactUs.update({
      where: { id },
      data,
    });
  }

  async updateMine(userId: string, id: string, dto: UpdateContactUsDto) {
    const existing = await this.prisma.contactUs.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Contact message not found');
    }

    return this.prisma.contactUs.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: normalizeFormTextFields(dto.name) } : {}),
        ...(dto.message !== undefined ? { message: normalizeFormTextFields(dto.message) } : {}),
      },
    });
  }

  async markThreadRead(id: string, dto: UpdateContactUsDto) {
    const existing = await this.prisma.contactUs.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Contact message not found');
    }

    const targetUserId =
      dto.replyToUserId?.trim() || dto.userId?.trim() || existing.userId;
    const targetStudentId =
      dto.studentId?.trim() ||
      dto.studentIds?.find((studentId) => studentId.trim()) ||
      existing.studentId;

    const threadMatches: Prisma.ContactUsWhereInput[] = [{ id }];

    if (targetUserId) {
      threadMatches.push({ userId: targetUserId });
    }

    if (targetStudentId) {
      threadMatches.push({ studentId: targetStudentId });
    }

    await this.prisma.contactUs.updateMany({
      where: {
        OR: threadMatches,
        senderName: {
          not: 'Admin',
        },
      },
      data: {
        status: ContactUsStatus.READ,
      },
    });

    return this.prisma.contactUs.findMany({
      where: { OR: threadMatches },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            fullNameWithSurname: true,
            nameWithInitials: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.contactUs.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Contact message not found');
    }

    await this.prisma.contactUs.delete({ where: { id } });
    return { message: 'Contact message deleted successfully' };
  }

  async removeMine(userId: string, id: string) {
    const existing = await this.prisma.contactUs.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Contact message not found');
    }

    return this.remove(id);
  }

  async removeMyThread(userId: string) {
    const result = await this.prisma.contactUs.deleteMany({
      where: { userId },
    });

    return {
      message: 'Contact messages deleted successfully',
      deletedCount: result.count,
    };
  }

  async removeThreadByMessageId(id: string) {
    const existing = await this.prisma.contactUs.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Contact message not found');
    }

    const where: Prisma.ContactUsWhereInput = {
      OR: [
        existing.userId ? { userId: existing.userId } : undefined,
        existing.studentId ? { studentId: existing.studentId } : undefined,
      ].filter(Boolean) as Prisma.ContactUsWhereInput[],
    };

    if (!where.OR || where.OR.length === 0) {
      await this.prisma.contactUs.delete({ where: { id } });
      return {
        message: 'Contact message deleted successfully',
        deletedCount: 1,
      };
    }

    const result = await this.prisma.contactUs.deleteMany({ where });

    return {
      message: 'Contact messages deleted successfully',
      deletedCount: result.count,
    };
  }
}

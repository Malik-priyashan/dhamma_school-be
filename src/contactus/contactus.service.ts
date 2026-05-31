import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactUsStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeFormTextFields } from '../common/text-normalizer';
import { CreateContactUsDto } from './dto/create-contactus.dto';
import { UpdateContactUsDto } from './dto/update-contactus.dto';

@Injectable()
export class ContactUsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContactUsDto, userId?: string) {
    const studentId = dto.studentId?.trim();
    const targetUserId =
      dto.replyToUserId?.trim() || userId || dto.userId?.trim();
    const data: Prisma.ContactUsCreateInput = {
      name: normalizeFormTextFields(dto.name),
      message: normalizeFormTextFields(dto.message),
      senderName: normalizeFormTextFields(dto.senderName),
      status: dto.status ?? 'NOT_READ',
      ...(targetUserId ? { user: { connect: { id: targetUserId } } } : {}),
      ...(studentId ? { student: { connect: { id: studentId } } } : {}),
    };

    return this.prisma.contactUs.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            students: {
              select: {
                id: true,
                fullNameWithSurname: true,
                nameWithInitials: true,
              },
            },
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
  }

  async findAll() {
    return this.prisma.contactUs.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            students: {
              select: {
                id: true,
                fullNameWithSurname: true,
                nameWithInitials: true,
              },
            },
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
            students: {
              select: {
                id: true,
                fullNameWithSurname: true,
                nameWithInitials: true,
              },
            },
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
      data.user = { connect: { id: targetUserId } };
    }

    if (studentId) {
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

    return this.update(id, dto);
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
            students: {
              select: {
                id: true,
                fullNameWithSurname: true,
                nameWithInitials: true,
              },
            },
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

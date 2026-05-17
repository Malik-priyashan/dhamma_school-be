import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateAnnouncingDto } from './dto/create-announcing.dto';
import { QueryAnnouncingDto } from './dto/query-announcing.dto';
import { UpdateAnnouncingDto } from './dto/update-announcing.dto';

@Injectable()
export class AnnouncingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAnnouncingDto) {
    let birthday: Date | undefined = undefined;
    if (dto.birthday) {
      const date = new Date(dto.birthday);
      if (!isNaN(date.getTime())) {
        birthday = date;
      }
    }

    const data: Prisma.AnnouncingFormCreateInput = {
      fullNameWithSurname: dto.fullNameWithSurname,
      birthday,
      address: dto.address,
      phoneLand: dto.phoneLand,
      phoneMobile: dto.phoneMobile,
      school: dto.school,
      guardianName: dto.guardianName,
      guardianAddress: dto.guardianAddress,
      studentAgreement: dto.studentAgreement ?? false,
      marks: dto.marks,
      status: dto.status,
    };

    if (dto.special) {
      data.special = {
        create: {
          announcing: dto.special.announcing as Prisma.InputJsonValue,
          dancing: dto.special.dancing as Prisma.InputJsonValue,
          kathika: dto.special.kathika as Prisma.InputJsonValue,
          padyagayana: dto.special.padyagayana as Prisma.InputJsonValue,
          debate: dto.special.debate as Prisma.InputJsonValue,
          acting: dto.special.acting as Prisma.InputJsonValue,
          singing: dto.special.singing as Prisma.InputJsonValue,
          prefectOrClassLeader: dto.special
            .prefectOrClassLeader as Prisma.InputJsonValue,
          committee: dto.special.committee as Prisma.InputJsonValue,
          other: dto.special.other as Prisma.InputJsonValue,
        },
      };
    }

    return this.prisma.announcingForm.create({
      data,
      include: { special: true },
    });
  }

  async findAll(query?: QueryAnnouncingDto) {
    const where: Prisma.AnnouncingFormWhereInput = {};

    if (query) {
      if (query.status) where.status = query.status;
      if (query.school)
        where.school = { contains: query.school, mode: 'insensitive' };
      if (typeof query.studentAgreement === 'boolean')
        where.studentAgreement = query.studentAgreement;
      if (query.name && query.name.trim() !== '') {
        where.fullNameWithSurname = {
          contains: query.name.trim(),
          mode: 'insensitive',
        };
      }
    }

    const total = await this.prisma.announcingForm.count({ where });

    let page = query?.page ? Number(query.page) : 1;
    let limit = query?.limit ? Number(query.limit) : 15;

    let take = limit;
    let skip = (page - 1) * limit;

    if (query?.take !== undefined) {
      take = Number(query.take);
      limit = take;
    }
    if (query?.skip !== undefined) {
      skip = Number(query.skip);
      page = Math.floor(skip / limit) + 1;
    }

    const ALLOWED_ORDER = ['createdAt', 'marks'];
    let orderBy:
      | Prisma.AnnouncingFormOrderByWithRelationInput
      | Prisma.AnnouncingFormOrderByWithRelationInput[] = { createdAt: 'desc' };
    if (query?.orderBy && ALLOWED_ORDER.includes(query.orderBy)) {
      const dir = query.orderDir === 'asc' ? 'asc' : 'desc';
      orderBy = {
        [query.orderBy]: dir,
      } as Prisma.AnnouncingFormOrderByWithRelationInput;
    } else {
      orderBy = { createdAt: 'desc' };
    }

    const data = await this.prisma.announcingForm.findMany({
      where,
      take,
      skip,
      orderBy,
      include: { special: true },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, dto: UpdateAnnouncingDto) {
    const existing = await this.prisma.announcingForm.findUnique({
      where: { id },
      include: { special: true },
    });
    if (!existing) {
      throw new NotFoundException('Announcing application not found');
    }

    let birthday: Date | undefined | null = undefined;
    if (dto.birthday !== undefined) {
      if (dto.birthday === null || dto.birthday === '') {
        birthday = null;
      } else {
        const date = new Date(dto.birthday);
        if (!isNaN(date.getTime())) {
          birthday = date;
        }
      }
    }

    const data: Prisma.AnnouncingFormUpdateInput = {
      fullNameWithSurname: dto.fullNameWithSurname,
      birthday,
      address: dto.address,
      phoneLand: dto.phoneLand,
      phoneMobile: dto.phoneMobile,
      school: dto.school,
      guardianName: dto.guardianName,
      guardianAddress: dto.guardianAddress,
      studentAgreement: dto.studentAgreement,
      marks:
        dto.marks !== undefined
          ? dto.marks === null
            ? null
            : Number(dto.marks)
          : undefined,
      status: dto.status,
    };

    // Remove undefined fields
    Object.keys(data).forEach((key) => {
      if ((data as Record<string, unknown>)[key] === undefined) {
        delete (data as Record<string, unknown>)[key];
      }
    });

    if (dto.special) {
      const specialData: Record<string, Prisma.InputJsonValue> = {};
      const specialFields: string[] = [
        'announcing',
        'dancing',
        'kathika',
        'padyagayana',
        'debate',
        'acting',
        'singing',
        'prefectOrClassLeader',
        'committee',
        'other',
      ];
      specialFields.forEach((field) => {
        const val = dto.special
          ? (dto.special as Record<string, unknown>)[field]
          : undefined;
        if (val !== undefined) {
          specialData[field] = val as Prisma.InputJsonValue;
        }
      });

      if (existing.special) {
        data.special = {
          update: specialData,
        };
      } else {
        data.special = {
          create: specialData,
        };
      }
    }

    return this.prisma.announcingForm.update({
      where: { id },
      data,
      include: { special: true },
    });
  }
}

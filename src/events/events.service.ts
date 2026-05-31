import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeFormTextFields } from '../common/text-normalizer';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  private parseDate(value: string | Date | undefined, fieldName: string) {
    if (!value) {
      throw new BadRequestException(`${fieldName} is required`);
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${fieldName} must be a valid date`);
    }

    return date;
  }

  async create(dto: CreateEventDto) {
    const happenedDate = this.parseDate(dto.happenedDate, 'happenedDate');

    const data = normalizeFormTextFields({
      image: dto.image,
      images: dto.images,
      topic: dto.topic,
      topicSi: dto.topicSi,
      description: dto.description,
      descriptionSi: dto.descriptionSi,
      happenedDate,
    });

    return this.prisma.event.create({
      data: data as Prisma.EventCreateInput,
    });
  }

  async findAll(query?: QueryEventDto) {
    const where: Prisma.EventWhereInput = {};

    if (query?.topic && query.topic.trim() !== '') {
      where.OR = [
        { topic: { contains: query.topic.trim(), mode: 'insensitive' } },
        {
          topicSi: {
            contains: query.topic.trim(),
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query.topic.trim(),
            mode: 'insensitive',
          },
        },
        {
          descriptionSi: {
            contains: query.topic.trim(),
            mode: 'insensitive',
          },
        },
      ];
    }

    const total = await this.prisma.event.count({ where });

    const page = query?.page ? Number(query.page) : 1;
    const limit = query?.limit ? Number(query.limit) : 15;
    const orderDir = query?.orderDir === 'asc' ? 'asc' : 'desc';

    const data = await this.prisma.event.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ happenedDate: orderDir }, { createdAt: orderDir }],
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(id: string, dto: UpdateEventDto) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Event not found');
    }

    const happenedDate =
      dto.happenedDate !== undefined
        ? this.parseDate(dto.happenedDate, 'happenedDate')
        : undefined;

    const data = normalizeFormTextFields({
      image: dto.image,
      images: dto.images,
      topic: dto.topic,
      topicSi: dto.topicSi,
      description: dto.description,
      descriptionSi: dto.descriptionSi,
      happenedDate,
    });

    Object.keys(data).forEach((key) => {
      if ((data as Record<string, unknown>)[key] === undefined) {
        delete (data as Record<string, unknown>)[key];
      }
    });

    return this.prisma.event.update({
      where: { id },
      data: data as Prisma.EventUpdateInput,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Event not found');
    }

    await this.prisma.event.delete({ where: { id } });
    return { message: 'Event deleted successfully' };
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeFormTextFields } from '../common/text-normalizer';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { QueryNewsDto } from './dto/query-news.dto';

@Injectable()
export class NewsService {
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

  async create(dto: CreateNewsDto) {
    const happenedDate = this.parseDate(dto.happenedDate, 'happenedDate');

    const data = normalizeFormTextFields({
      image: dto.image,
      topic: dto.topic,
      topicSi: dto.topicSi,
      description: dto.description,
      descriptionSi: dto.descriptionSi,
      happenedDate,
    });

    return this.prisma.news.create({
      data: data as Prisma.NewsCreateInput,
    });
  }

  async findAll(query?: QueryNewsDto) {
    const where: Prisma.NewsWhereInput = {};

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

    const total = await this.prisma.news.count({ where });

    const page = query?.page ? Number(query.page) : 1;
    const limit = query?.limit ? Number(query.limit) : 15;
    const orderDir = query?.orderDir === 'asc' ? 'asc' : 'desc';

    const data = await this.prisma.news.findMany({
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
    const news = await this.prisma.news.findUnique({ where: { id } });
    if (!news) {
      throw new NotFoundException('News item not found');
    }
    return news;
  }

  async update(id: string, dto: UpdateNewsDto) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('News item not found');
    }

    const happenedDate =
      dto.happenedDate !== undefined
        ? this.parseDate(dto.happenedDate, 'happenedDate')
        : undefined;

    const data = normalizeFormTextFields({
      image: dto.image,
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

    return this.prisma.news.update({
      where: { id },
      data: data as Prisma.NewsUpdateInput,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('News item not found');
    }

    await this.prisma.news.delete({ where: { id } });
    return { message: 'News item deleted successfully' };
  }
}

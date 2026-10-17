import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMarkDto } from './dto/create-mark.dto';
import { UpdateMarkDto } from './dto/update-mark.dto';

@Injectable()
export class MarksService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateMarkDto) {
    return this.prisma.marks.create({ data: dto });
  }

  async findOwnedStudentIds(userId: string): Promise<string[]> {
    const students = await this.prisma.student.findMany({
      where: { userId },
      select: { id: true },
    });
    return students.map((student) => student.id);
  }

  findAll(studentId?: string, year?: number, term?: string, ownedStudentIds?: string[]) {
    const where: Prisma.MarksWhereInput = {};
    if (ownedStudentIds) where.studentId = { in: ownedStudentIds };
    if (studentId) where.studentId = studentId;
    if (year && Number.isInteger(year)) where.year = year;
    if (term === '1') where.term1Marks = { not: null };
    if (term === '2') where.term2Marks = { not: null };
    if (term === '3') where.term3Marks = { not: null };

    return this.prisma.marks.findMany({
      where,
      include: { student: { select: { id: true, grade: true, userId: true } } },
    });
  }

  async findOne(id: string) {
    const mark = await this.prisma.marks.findUnique({
      where: { id },
      include: { student: { select: { id: true, grade: true, userId: true } } },
    });
    if (!mark) throw new NotFoundException(`Marks record with ID ${id} not found`);
    return mark;
  }

  async update(id: string, dto: UpdateMarkDto) {
    await this.findOne(id);
    return this.prisma.marks.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.marks.delete({ where: { id } });
  }
}

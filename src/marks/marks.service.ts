/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMarkDto } from './dto/create-mark.dto';
import { UpdateMarkDto } from './dto/update-mark.dto';
// types were removed to avoid unused import warnings

@Injectable()
export class MarksService {
  constructor(private prisma: PrismaService) {}

  async create(createMarkDto: CreateMarkDto) {
    return this.prisma.marks.create({
      data: createMarkDto,
    });
  }

  async findAll(
    studentId?: string,
    year?: number,
    term?: string,
  ): Promise<any[]> {
    const where: Record<string, unknown> = {};
    if (studentId) {
      // Check if studentId is a valid student UUID
      const student = await this.prisma.student.findUnique({
        where: { id: studentId },
      });

      if (student) {
        where['studentId'] = studentId;
      } else {
        // Check if studentId is actually a User ID (for logged-in students)
        const user = await this.prisma.user.findUnique({
          where: { id: studentId },
        });
        if (user) {
          // Find student directly associated with this user ID
          const matchedStudent = await this.prisma.student.findFirst({
            where: { userId: user.id },
          });

          if (matchedStudent) {
            where['studentId'] = matchedStudent.id;
          } else {
            // Fallback to name matching for legacy or unlinked records
            if (user.fullName) {
              const fallbackStudent = await this.prisma.student.findFirst({
                where: {
                  OR: [
                    {
                      fullNameWithSurname: {
                        contains: user.fullName,
                        mode: 'insensitive',
                      },
                    },
                    {
                      nameWithInitials: {
                        contains: user.fullName,
                        mode: 'insensitive',
                      },
                    },
                  ],
                },
              });

              if (fallbackStudent) {
                where['studentId'] = fallbackStudent.id;
              } else {
                return [] as any[];
              }
            } else {
              return [] as any[];
            }
          }
        } else {
          return [] as any[];
        }
      }
    }
    if (year) {
      where['year'] = year;
    }

    if (term === '1') {
      where['term1Marks'] = { not: null };
    } else if (term === '2') {
      where['term2Marks'] = { not: null };
    } else if (term === '3') {
      where['term3Marks'] = { not: null };
    }

    const raw = (await this.prisma.marks.findMany({
      where: where as any,
      include: {
        student: true,
      },
    })) as unknown;

    return raw as any[];
  }

  async findOne(id: string) {
    const mark = await this.prisma.marks.findUnique({
      where: { id },
      include: { student: true },
    });
    if (!mark)
      throw new NotFoundException(`Marks record with ID ${id} not found`);
    return mark;
  }

  async update(id: string, updateMarkDto: UpdateMarkDto) {
    // Check if exists
    await this.findOne(id);
    return this.prisma.marks.update({
      where: { id },
      data: updateMarkDto,
    });
  }

  async remove(id: string) {
    // Check if exists
    await this.findOne(id);
    return this.prisma.marks.delete({
      where: { id },
    });
  }
}

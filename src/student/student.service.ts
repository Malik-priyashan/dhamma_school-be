import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateStudentDto) {
    if (!data) {
      throw new BadRequestException('Missing request body');
    }

    const siblingsArr = Array.isArray(data.siblings) ? data.siblings : [];
    const siblingsData = siblingsArr.map((s) => ({
      name: s?.name,
      grade: s?.grade,
    }));

    const registrationDate = data.registrationDate
      ? new Date(data.registrationDate)
      : undefined;
    const dob = data.dob ? new Date(data.dob) : undefined;

    return this.prisma.student.create({
      data: {
        fullNameWithSurname: data.fullNameWithSurname,
        nameWithInitials: data.nameWithInitials,
        dob,
        address: data.address,
        phone1: data.phone1,
        phone2: data.phone2,
        school: data.school,

        earlierSchool: !!data.earlierSchool,
        earlierSchoolReason: data.earlierSchoolReason,
        reasonForLeave: data.reasonForLeave,

        fatherFullName: data.fatherFullName,
        fatherJob: data.fatherJob,
        fatherJobAddress: data.fatherJobAddress,

        motherFullName: data.motherFullName,
        motherJob: data.motherJob,
        motherJobAddress: data.motherJobAddress,

        guardianFullName: data.guardianFullName,
        guardianJob: data.guardianJob,
        guardianJobAddress: data.guardianJobAddress,

        medicine: data.medicine,

        emergencyPersonName: data.emergencyPersonName,
        emergencyPersonAddress: data.emergencyPersonAddress,
        emergencyNumber: data.emergencyNumber,

        disabilities: !!data.disabilities,
        disabilityReason: data.disabilityReason,
        medicated: !!data.medicated,

        registrationPayment: data.registrationPayment,
        registrationDate,

        indexNo: data.indexNo,
        libraryNo: data.libraryNo,
        house: data.house,
        grade: data.grade,
        studentActiveMonitor: data.studentActiveMonitor || 'NOT_GIVEN',

        agreeToTerms: !!data.agreeToTerms,
        studentImage: data.studentImage,

        siblings: siblingsData.length ? { create: siblingsData } : undefined,
      },
      include: { siblings: true },
    });
  }

  async findAll(
    grade?: string,
    name?: string,
    pageParam?: string | number,
    limitParam?: string | number,
  ) {
    const filters: any[] = [];

    if (grade && grade.trim() !== '') {
      filters.push({ grade: grade.trim() });
    }

    if (name && name.trim() !== '') {
      filters.push({
        OR: [
          {
            fullNameWithSurname: { contains: name.trim(), mode: 'insensitive' },
          },
          { nameWithInitials: { contains: name.trim(), mode: 'insensitive' } },
          { address: { contains: name.trim(), mode: 'insensitive' } },
        ],
      });
    }

    const where = filters.length > 0 ? { AND: filters } : {};

    const page = pageParam ? Number(pageParam) : 1;
    const limit = limitParam ? Number(limitParam) : 15;

    const total = await this.prisma.student.count({ where });

    const data = await this.prisma.student.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { siblings: true },
      orderBy: { createdAt: 'desc' },
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
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { siblings: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async update(id: string, data: UpdateStudentDto) {
    const existing = await this.prisma.student.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Student not found');
    }

    const siblingsArr = Array.isArray(data.siblings)
      ? data.siblings
      : undefined;
    const siblingsData = siblingsArr?.map((s) => ({
      name: s?.name,
      grade: s?.grade,
    }));

    const updateData: Prisma.StudentUpdateInput = {
      fullNameWithSurname: data.fullNameWithSurname,
      nameWithInitials: data.nameWithInitials,
      address: data.address,
      phone1: data.phone1,
      phone2: data.phone2,
      school: data.school,
      earlierSchoolReason: data.earlierSchoolReason,
      reasonForLeave: data.reasonForLeave,
      fatherFullName: data.fatherFullName,
      fatherJob: data.fatherJob,
      fatherJobAddress: data.fatherJobAddress,
      motherFullName: data.motherFullName,
      motherJob: data.motherJob,
      motherJobAddress: data.motherJobAddress,
      guardianFullName: data.guardianFullName,
      guardianJob: data.guardianJob,
      guardianJobAddress: data.guardianJobAddress,
      emergencyPersonName: data.emergencyPersonName,
      emergencyPersonAddress: data.emergencyPersonAddress,
      emergencyNumber: data.emergencyNumber,
      disabilityReason: data.disabilityReason,
      medicine: data.medicine,
      registrationPayment: data.registrationPayment,
      indexNo: data.indexNo,
      libraryNo: data.libraryNo,
      house: data.house,
      grade: data.grade,
      studentActiveMonitor: data.studentActiveMonitor,
      studentImage: data.studentImage,
    };

    if (data.dob !== undefined) {
      updateData.dob = data.dob ? new Date(data.dob) : null;
    }

    if (data.registrationDate !== undefined) {
      updateData.registrationDate = data.registrationDate
        ? new Date(data.registrationDate)
        : null;
    }

    if (data.earlierSchool !== undefined) {
      updateData.earlierSchool = !!data.earlierSchool;
    }

    if (data.disabilities !== undefined) {
      updateData.disabilities = data.disabilities;
    }

    if (data.medicated !== undefined) {
      updateData.medicated = data.medicated;
    }

    if (data.agreeToTerms !== undefined) {
      updateData.agreeToTerms = !!data.agreeToTerms;
    }

    if (siblingsData !== undefined) {
      updateData.siblings = {
        deleteMany: {},
        create: siblingsData,
      };
    }

    return this.prisma.student.update({
      where: { id },
      data: updateData,
      include: { siblings: true },
    });
  }
}

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { normalizeFormTextFields } from '../common/text-normalizer';

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
        fullNameWithSurname: normalizeFormTextFields(
          data.fullNameWithSurname,
          'fullNameWithSurname',
        ),
        nameWithInitials: normalizeFormTextFields(
          data.nameWithInitials,
          'nameWithInitials',
        ),
        dob,
        address: normalizeFormTextFields(data.address, 'address'),
        phone1: data.phone1,
        phone2: data.phone2,
        school: normalizeFormTextFields(data.school, 'school'),

        earlierSchool: !!data.earlierSchool,
        earlierSchoolReason: normalizeFormTextFields(
          data.earlierSchoolReason,
          'earlierSchoolReason',
        ),
        reasonForLeave: normalizeFormTextFields(
          data.reasonForLeave,
          'reasonForLeave',
        ),

        fatherFullName: normalizeFormTextFields(
          data.fatherFullName,
          'fatherFullName',
        ),
        fatherJob: normalizeFormTextFields(data.fatherJob, 'fatherJob'),
        fatherJobAddress: normalizeFormTextFields(
          data.fatherJobAddress,
          'fatherJobAddress',
        ),

        motherFullName: normalizeFormTextFields(
          data.motherFullName,
          'motherFullName',
        ),
        motherJob: normalizeFormTextFields(data.motherJob, 'motherJob'),
        motherJobAddress: normalizeFormTextFields(
          data.motherJobAddress,
          'motherJobAddress',
        ),

        guardianFullName: normalizeFormTextFields(
          data.guardianFullName,
          'guardianFullName',
        ),
        guardianJob: normalizeFormTextFields(data.guardianJob, 'guardianJob'),
        guardianJobAddress: normalizeFormTextFields(
          data.guardianJobAddress,
          'guardianJobAddress',
        ),

        medicine: normalizeFormTextFields(data.medicine, 'medicine'),

        emergencyPersonName: normalizeFormTextFields(
          data.emergencyPersonName,
          'emergencyPersonName',
        ),
        emergencyPersonAddress: normalizeFormTextFields(
          data.emergencyPersonAddress,
          'emergencyPersonAddress',
        ),
        emergencyNumber: data.emergencyNumber,

        disabilities: !!data.disabilities,
        disabilityReason: normalizeFormTextFields(
          data.disabilityReason,
          'disabilityReason',
        ),
        medicated: !!data.medicated,

        registrationPayment: data.registrationPayment,
        registrationDate,

        indexNo: data.indexNo,
        libraryNo: data.libraryNo,
        house: normalizeFormTextFields(data.house, 'house'),
        grade: data.grade,
        studentActiveMonitor: data.studentActiveMonitor || 'NOT_GIVEN',

        agreeToTerms: !!data.agreeToTerms,
        studentImage: data.studentImage,
        userId: data.userId,

        siblings: siblingsData.length
          ? { create: normalizeFormTextFields(siblingsData) }
          : undefined,
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

    const updateData = normalizeFormTextFields({
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
    }) as Prisma.StudentUpdateInput & Record<string, any>;

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

    if (data.userId !== undefined) {
      updateData.user = data.userId
        ? { connect: { id: data.userId } }
        : { disconnect: true };
    }

    if (siblingsData !== undefined) {
      updateData.siblings = {
        deleteMany: {},
        create: normalizeFormTextFields(siblingsData),
      };
    }

    return this.prisma.student.update({
      where: { id },
      data: updateData,
      include: { siblings: true },
    });
  }

  async promoteGrades() {
    return this.prisma.$transaction(async (tx) => {
      // 1. Find all students in Grade 11
      const grade11Students = await tx.student.findMany({
        where: { grade: '11' },
        select: { id: true },
      });

      const ids = grade11Students.map((s) => s.id);

      if (ids.length > 0) {
        // Delete related StudentSibling records
        await tx.studentSibling.deleteMany({
          where: { studentId: { in: ids } },
        });

        // Delete related RegistrationPayment records
        await tx.registrationPayment.deleteMany({
          where: { studentId: { in: ids } },
        });

        // Delete related Marks records
        await tx.marks.deleteMany({
          where: { studentId: { in: ids } },
        });

        // Delete the students themselves
        await tx.student.deleteMany({
          where: { id: { in: ids } },
        });
      }

      // 2. Increment grades 10 down to 1
      for (let i = 10; i >= 1; i--) {
        await tx.student.updateMany({
          where: { grade: i.toString() },
          data: { grade: (i + 1).toString() },
        });
      }

      return {
        message:
          'Grades promoted successfully. Grade 11 students graduated/removed.',
        graduatedCount: ids.length,
      };
    });
  }

  async findMyStudents(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return [];
    }

    // Return only students directly created/registered by this user
    return this.prisma.student.findMany({
      where: { userId: user.id },
      orderBy: { fullNameWithSurname: 'asc' },
    });
  }
}

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { StudentRequestStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentRequestDto } from './dto/create-student-request.dto';
import { normalizeFormTextFields } from '../common/text-normalizer';

@Injectable()
export class StudentRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async createRequest(data: CreateStudentRequestDto) {
    if (!data) {
      throw new BadRequestException('Missing request body');
    }
    const siblingsArr = Array.isArray(data.siblings) ? data.siblings : [];
    const siblingsData = siblingsArr.map((s) => ({
      name: s?.name,
      grade: s?.grade,
    }));

    // convert registrationDate / dob if provided
    const parseDate = (v: unknown) => {
      if (!v) return undefined;
      const d = new Date(v as string | number | Date);
      return isNaN(d.getTime()) ? undefined : d;
    };

    const registrationDate = parseDate(data.registrationDate);
    const dob = parseDate(data.dob);

    const toBoolean = (v: unknown) => {
      if (v === undefined || v === null) return undefined;
      if (typeof v === 'boolean') return v;
      if (typeof v !== 'string' && typeof v !== 'number') return undefined;
      const s = String(v).trim().toLowerCase();
      if (s === 'yes' || s === 'true') return true;
      if (s === 'no' || s === 'false') return false;
      return undefined;
    };
    const normalizeStudentMonitor = (v: unknown) => {
      if (typeof v === 'string') {
        const s = v.trim().toUpperCase();
        if (s === 'GIVEN' || s === 'NOT_GIVEN') return s;
      }
      return 'NOT_GIVEN';
    };

    const commonData = normalizeFormTextFields({
      fullNameWithSurname: data.fullNameWithSurname,
      nameWithInitials: data.nameWithInitials,
      dob,
      address: data.address,
      phone1: data.phone1,
      phone2: data.phone2,
      school: data.school,

      earlierSchool: toBoolean(data.earlierSchool),
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

      disabilities: data.disabilities,
      disabilityReason: data.disabilityReason,
      medicated: data.medicated,

      registrationPayment: data.registrationPayment,
      registrationDate,

      indexNo: data.indexNo,
      libraryNo: data.libraryNo,
      house: data.house,
      grade: data.grade,
      studentActiveMonitor: normalizeStudentMonitor(data.studentActiveMonitor),

      agreeToTerms: !!data.agreeToTerms,
      studentImage: data.studentImage,
      userId: data.userId,
    } as const);

    // Log the final payload so we can inspect enum values before Prisma call
    // (remove or lower log level in production)

    console.debug('studentRequest.create payload:', JSON.stringify(commonData));

    const created = await this.prisma.studentRequest.create({
      data: {
        ...commonData,
        siblings: siblingsData.length
          ? { create: normalizeFormTextFields(siblingsData) }
          : undefined,
      },
      include: { siblings: true },
    });

    return this.mapRequest(created);
  }

  async findAllRequests(params?: {
    status?: string;
    createdDate?: string;
    page?: string | number;
    limit?: string | number;
  }) {
    const page = params?.page ? Number(params.page) : 1;
    const limit = params?.limit ? Number(params.limit) : 15;

    const filters: Prisma.StudentRequestWhereInput[] = [];

    if (params?.status && params.status.trim() !== '') {
      const upperStatus = params.status
        .trim()
        .toUpperCase() as StudentRequestStatus;
      if (Object.values(StudentRequestStatus).includes(upperStatus)) {
        filters.push({ status: upperStatus });
      }
    }

    if (params?.createdDate && params.createdDate.trim() !== '') {
      const date = new Date(params.createdDate.trim());
      if (!isNaN(date.getTime())) {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        filters.push({
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        });
      }
    }

    const where = filters.length > 0 ? { AND: filters } : {};

    const total = await this.prisma.studentRequest.count({ where });

    const results = await this.prisma.studentRequest.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { siblings: true },
      orderBy: { createdAt: 'desc' },
    });

    const data = results.map((r) => this.mapRequest(r));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async acceptRequest(requestId: string) {
    const request = await this.prisma.studentRequest.findUnique({
      where: { id: requestId },
      include: { siblings: true },
    });

    if (!request) {
      throw new NotFoundException('Student request not found');
    }

    if (request.status !== StudentRequestStatus.PENDING) {
      throw new ConflictException(
        `Student request is already ${request.status.toLowerCase()}`,
      );
    }

    const student = await this.prisma.$transaction(async (tx) => {
      const createdStudent = await tx.student.create({
        data: {
          fullNameWithSurname: request.fullNameWithSurname,
          nameWithInitials: request.nameWithInitials,
          dob: request.dob,
          address: request.address,
          phone1: request.phone1,
          phone2: request.phone2,
          school: request.school,

          earlierSchool: request.earlierSchool,
          earlierSchoolReason: request.earlierSchoolReason,
          reasonForLeave: request.reasonForLeave,

          fatherFullName: request.fatherFullName,
          fatherJob: request.fatherJob,
          fatherJobAddress: request.fatherJobAddress,

          motherFullName: request.motherFullName,
          motherJob: request.motherJob,
          motherJobAddress: request.motherJobAddress,

          guardianFullName: request.guardianFullName,
          guardianJob: request.guardianJob,
          guardianJobAddress: request.guardianJobAddress,

          medicine: request.medicine,

          emergencyPersonName: request.emergencyPersonName,
          emergencyPersonAddress: request.emergencyPersonAddress,
          emergencyNumber: request.emergencyNumber,

          disabilities: request.disabilities,
          disabilityReason: request.disabilityReason,
          medicated: request.medicated,

          registrationPayment: request.registrationPayment,
          registrationDate: request.registrationDate,

          indexNo: request.indexNo,
          libraryNo: request.libraryNo,
          house: request.house,
          grade: request.grade,
          studentActiveMonitor: request.studentActiveMonitor,

          agreeToTerms: request.agreeToTerms,
          studentImage: request.studentImage,
          userId: request.userId,

          siblings: request.siblings.length
            ? {
                create: request.siblings.map((sibling) => ({
                  name: normalizeFormTextFields(sibling.name, 'name'),
                  grade: sibling.grade,
                })),
              }
            : undefined,
        },
        include: { siblings: true },
      });

      await tx.studentRequest.update({
        where: { id: requestId },
        data: { status: StudentRequestStatus.ACCEPTED },
      });

      return createdStudent;
    });

    return {
      message: 'Student request accepted and student created successfully',
      student,
    };
  }

  async rejectRequest(requestId: string) {
    const request = await this.prisma.studentRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Student request not found');
    }

    if (request.status !== StudentRequestStatus.PENDING) {
      throw new ConflictException(
        `Student request is already ${request.status.toLowerCase()}`,
      );
    }

    const updated = await this.prisma.studentRequest.update({
      where: { id: requestId },
      data: { status: StudentRequestStatus.REJECTED },
    });

    return {
      message: 'Student request rejected successfully',
      request: this.mapRequest(updated),
    };
  }

  private mapRequest<T extends { dob?: Date | null }>(r: T) {
    // ensure grade is present and convert dob to a birthday string (YYYY-MM-DD)
    const birthday = r?.dob
      ? new Date(r.dob).toISOString().split('T')[0]
      : null;

    return {
      ...r,
      birthday,
      // keep `dob` for compatibility, and `grade` is already present
    };
  }
}

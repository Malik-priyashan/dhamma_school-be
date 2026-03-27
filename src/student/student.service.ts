import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateStudentDto) {
    if (!data) {
      throw new BadRequestException('Missing request body');
    }
    const siblingsArr = Array.isArray(data.siblings) ? data.siblings : [];
    const siblingsData = siblingsArr.map((s) => ({
      nameEn: s?.nameEn,
      nameSi: s?.nameSi,
      gradeEn: s?.gradeEn,
      gradeSi: s?.gradeSi,
    }));

    // convert registrationDate / dob if provided
    const registrationDate = data.registrationDate
      ? new Date(data.registrationDate)
      : undefined;
    const dob = data.dob ? new Date(data.dob) : undefined;

    const created = await this.prisma.student.create({
      data: {
        fullNameWithSurnameEn: data.fullNameWithSurnameEn,
        fullNameWithSurnameSi: data.fullNameWithSurnameSi,
        nameWithInitialsEn: data.nameWithInitialsEn,
        nameWithInitialsSi: data.nameWithInitialsSi,
        dob,
        addressEn: data.addressEn,
        addressSi: data.addressSi,
        phone1: data.phone1,
        phone2: data.phone2,
        schoolEn: data.schoolEn,
        schoolSi: data.schoolSi,
        earlierSchoolEn: data.earlierSchoolEn,
        earlierSchoolSi: data.earlierSchoolSi,
        reasonForLeaveEn: data.reasonForLeaveEn,
        reasonForLeaveSi: data.reasonForLeaveSi,

        fatherFullNameEn: data.fatherFullNameEn,
        fatherFullNameSi: data.fatherFullNameSi,
        fatherJobEn: data.fatherJobEn,
        fatherJobSi: data.fatherJobSi,
        fatherJobAddressEn: data.fatherJobAddressEn,
        fatherJobAddressSi: data.fatherJobAddressSi,

        motherFullNameEn: data.motherFullNameEn,
        motherFullNameSi: data.motherFullNameSi,
        motherJobEn: data.motherJobEn,
        motherJobSi: data.motherJobSi,
        motherJobAddressEn: data.motherJobAddressEn,
        motherJobAddressSi: data.motherJobAddressSi,

        earlierSchool: data.earlierSchool ? 'YES' : 'NO',
        medicine: data.medicine,

        guardianFullNameEn: data.guardianFullNameEn,
        guardianFullNameSi: data.guardianFullNameSi,
        guardianJobEn: data.guardianJobEn,
        guardianJobSi: data.guardianJobSi,
        guardianJobAddressEn: data.guardianJobAddressEn,
        guardianJobAddressSi: data.guardianJobAddressSi,

        emergencyPersonNameEn: data.emergencyPersonNameEn,
        emergencyPersonNameSi: data.emergencyPersonNameSi,
        emergencyPersonAddressEn: data.emergencyPersonAddressEn,
        emergencyPersonAddressSi: data.emergencyPersonAddressSi,
        emergencyNumber: data.emergencyNumber,

        disabilities: data.disabilities ? 'YES' : 'NO',
        disabilityReasonEn: data.disabilityReasonEn,
        disabilityReasonSi: data.disabilityReasonSi,
        medicated: data.medicated ? 'YES' : 'NO',

        registrationPayment: data.registrationPayment,
        registrationDate,

        indexNo: data.indexNo,
        libraryNo: data.libraryNo,
        houseEn: data.houseEn,
        houseSi: data.houseSi,
        gradeEn: data.gradeEn,
        gradeSi: data.gradeSi,
        studentActiveMonitor: data.studentActiveMonitor || 'NOT_GIVEN',

        agreeToTerms: !!data.agreeToTerms,

        siblings: siblingsData.length ? { create: siblingsData } : undefined,
      },
      include: { siblings: true },
    });

    return created;
  }

  async findAll() {
    return this.prisma.student.findMany({ include: { siblings: true } });
  }
}

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrefectDto } from './dto/create-prefect.dto';
import { SelectionStatus, Prisma } from '@prisma/client';
import { normalizeFormTextFields } from '../common/text-normalizer';

@Injectable()
export class PrefectService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePrefectDto | Record<string, unknown>) {
    // whitelist only fields that exist on the PrefectBoard model
    const allowed = [
      'fullName',
      'address',
      'grade',
      'entranceDay',
      'entranceNo',
      'firstTermPlace',
      'firstTermMarks',
      'secondTermPlace',
      'secondTermMarks',
      'thirdTermPlace',
      'thirdTermMarks',
      'absentDaysCount',
      'isPrefect',
      'isPrefectYears',
      'isClassLeader',
      'isClassLeaderYears',
      'participateForCompetitions',
      'participateForCompetitionsYears',
      'isInAnnouncingClub',
      'isInAnnouncingClubYears',
      'isOnStage',
      'isOnStageYears',
      'participateToKatina',
      'participateToKatinaYears',
      'poyaDayCount',
      'studentAgreement',
      'parentsName',
      'parentsAgreement',
      'libraryStatus',
      'specialNote',
      'teachersAgreement',
      'teachersAgreementFile',
      'libraryStatusConfirmationFile',
      'teachersConfirmFile',
      'regNo',
      'marks',
      'status',
      'date',
    ];

    const payload: Record<string, unknown> = {};
    for (const key of allowed) {
      // allow both typed DTOs and raw request bodies
      let val: unknown = (data as Record<string, unknown>)[key];
      if (val === undefined) continue;

      // If form fields were sent as JSON strings for arrays or objects, try to parse
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          try {
            val = JSON.parse(trimmed);
          } catch {
            // leave as string
          }
        }
      }

      payload[key] = val;
    }

    if (payload.entranceDay && typeof payload.entranceDay === 'string') {
      payload.entranceDay = new Date(payload.entranceDay);
    }
    if (payload.date && typeof payload.date === 'string') {
      payload.date = new Date(payload.date);
    }

    // Convert certain fields to proper JS types expected by Prisma
    const floatFields = [
      'firstTermMarks',
      'secondTermMarks',
      'thirdTermMarks',
      'marks',
    ];
    for (const f of floatFields) {
      const value = payload[f];
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' || typeof value === 'number') {
          const n = Number(value);
          if (!Number.isNaN(n)) payload[f] = n;
        }
      }
    }

    const intFields = ['absentDaysCount', 'poyaDayCount'];
    for (const f of intFields) {
      const value = payload[f];
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' || typeof value === 'number') {
          const n = parseInt(String(value), 10);
          if (!Number.isNaN(n)) payload[f] = n;
        }
      }
    }

    const booleanFields = [
      'isPrefect',
      'isClassLeader',
      'participateForCompetitions',
      'isInAnnouncingClub',
      'isOnStage',
      'participateToKatina',
      'studentAgreement',
      'parentsAgreement',
      'teachersAgreement',
    ];
    for (const f of booleanFields) {
      const value = payload[f];
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string') {
          const normalized = value.trim().toLowerCase();
          if (normalized === 'yes' || normalized === 'true') {
            payload[f] = true;
          } else if (normalized === 'no' || normalized === 'false') {
            payload[f] = false;
          } else {
            payload[f] = Boolean(value);
          }
        } else if (typeof value === 'boolean') {
          payload[f] = value;
        } else {
          payload[f] = Boolean(value);
        }
      }
    }

    const intArrayFields = [
      'isPrefectYears',
      'isClassLeaderYears',
      'participateForCompetitionsYears',
      'isInAnnouncingClubYears',
      'isOnStageYears',
      'participateToKatinaYears',
    ];
    for (const f of intArrayFields) {
      const value = payload[f];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          payload[f] = value
            .map((v) => Number(v))
            .filter((n) => !Number.isNaN(n));
        } else if (typeof value === 'string') {
          try {
            const parsed: unknown = JSON.parse(value);
            if (Array.isArray(parsed)) {
              const nums = (parsed as unknown[])
                .map((v) => Number(String(v)))
                .filter((n) => !Number.isNaN(n));
              payload[f] = nums;
            } else payload[f] = [];
          } catch {
            payload[f] = [];
          }
        }
      }
    }

    // Ensure required Prisma fields are present and correctly typed.
    const fullNameVal = payload.fullName;
    if (fullNameVal === undefined || fullNameVal === null) {
      throw new BadRequestException('fullName is required');
    }
    if (typeof fullNameVal !== 'string') {
      if (typeof fullNameVal === 'number') {
        payload.fullName = String(fullNameVal);
      } else {
        throw new BadRequestException('fullName must be a string');
      }
    } else if ((payload.fullName as string).trim() === '') {
      throw new BadRequestException('fullName cannot be empty');
    }

    // Ensure status defaults to PENDING if not provided or empty
    if (!payload.status || payload.status === '') {
      payload.status = 'PENDING';
    }

    // payload is a runtime-shaped object built from trusted form fields.

    return this.prisma.prefectBoard.create({
      data: normalizeFormTextFields(
        payload,
      ) as unknown as Prisma.PrefectBoardCreateInput,
    });
  }

  async findAll(filters?: {
    status?: string;
    grade?: string;
    indexNo?: string;
    name?: string;
    page?: string | number;
    limit?: string | number;
  }) {
    const where: Prisma.PrefectBoardWhereInput = {};

    if (filters) {
      const { status, grade, indexNo, name } = filters;

      if (status && status.trim() !== '') {
        const upperStatus = status.trim().toUpperCase();
        if (['SELECTED', 'NOT_SELECTED', 'PENDING'].includes(upperStatus)) {
          where.status = upperStatus as SelectionStatus;
        }
      }

      if (grade && grade.trim() !== '') {
        where.grade = grade.trim();
      }

      if (indexNo && indexNo.trim() !== '') {
        const trimmedIndex = indexNo.trim();
        where.OR = [
          { regNo: { contains: trimmedIndex, mode: 'insensitive' } },
          { entranceNo: { contains: trimmedIndex, mode: 'insensitive' } },
        ];
      }

      if (name && name.trim() !== '') {
        where.fullName = { contains: name.trim(), mode: 'insensitive' };
      }
    }

    const page = filters?.page ? Number(filters.page) : 1;
    const limit = filters?.limit ? Number(filters.limit) : 15;

    const total = await this.prisma.prefectBoard.count({ where });

    const data = await this.prisma.prefectBoard.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
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

  async update(id: string, data: Record<string, any>) {
    const existing = await this.prisma.prefectBoard.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Prefect not found');
    }

    const dataRecord = data as Record<string, unknown>;

    const allowed = [
      'fullName',
      'address',
      'grade',
      'entranceDay',
      'entranceNo',
      'firstTermPlace',
      'firstTermMarks',
      'secondTermPlace',
      'secondTermMarks',
      'thirdTermPlace',
      'thirdTermMarks',
      'absentDaysCount',
      'isPrefect',
      'isPrefectYears',
      'isClassLeader',
      'isClassLeaderYears',
      'participateForCompetitions',
      'participateForCompetitionsYears',
      'isInAnnouncingClub',
      'isInAnnouncingClubYears',
      'isOnStage',
      'isOnStageYears',
      'participateToKatina',
      'participateToKatinaYears',
      'poyaDayCount',
      'studentAgreement',
      'parentsName',
      'parentsAgreement',
      'libraryStatus',
      'specialNote',
      'teachersAgreement',
      'teachersAgreementFile',
      'libraryStatusConfirmationFile',
      'teachersConfirmFile',
      'regNo',
      'marks',
      'status',
      'date',
    ];

    const payload: Record<string, unknown> = {};
    for (const key of allowed) {
      const val = dataRecord[key];
      if (val === undefined) continue;

      let parsedVal = val;

      // If form fields were sent as JSON strings for arrays or objects, try to parse
      if (typeof parsedVal === 'string') {
        const trimmed = parsedVal.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          try {
            parsedVal = JSON.parse(trimmed) as string;
          } catch {
            // leave as string
          }
        }
      }

      payload[key] = parsedVal;
    }

    // Convert dates
    if (payload.entranceDay === '' || payload.entranceDay === null) {
      payload.entranceDay = null;
    } else if (payload.entranceDay !== undefined) {
      payload.entranceDay = new Date(
        payload.entranceDay as string | number | Date,
      );
    }

    if (payload.date === '' || payload.date === null) {
      payload.date = null;
    } else if (payload.date !== undefined) {
      payload.date = new Date(payload.date as string | number | Date);
    }

    // Convert float fields
    const floatFields = [
      'firstTermMarks',
      'secondTermMarks',
      'thirdTermMarks',
      'marks',
    ];
    for (const f of floatFields) {
      const value = payload[f];
      if (value !== undefined) {
        if (value === null || value === '') {
          payload[f] = null;
        } else if (typeof value === 'string' || typeof value === 'number') {
          const n = Number(value);
          payload[f] = !Number.isNaN(n) ? n : null;
        }
      }
    }

    // Convert int fields
    const intFields = ['absentDaysCount', 'poyaDayCount'];
    for (const f of intFields) {
      const value = payload[f];
      if (value !== undefined) {
        if (value === null || value === '') {
          payload[f] = null;
        } else if (typeof value === 'string' || typeof value === 'number') {
          const n = parseInt(String(value), 10);
          payload[f] = !Number.isNaN(n) ? n : null;
        }
      }
    }

    // Convert boolean fields
    const booleanFields = [
      'isPrefect',
      'isClassLeader',
      'participateForCompetitions',
      'isInAnnouncingClub',
      'isOnStage',
      'participateToKatina',
      'studentAgreement',
      'parentsAgreement',
      'teachersAgreement',
    ];
    for (const f of booleanFields) {
      const value = payload[f];
      if (value !== undefined) {
        if (value === null || value === '') {
          payload[f] = false;
        } else if (typeof value === 'string') {
          const normalized = value.trim().toLowerCase();
          if (normalized === 'yes' || normalized === 'true') {
            payload[f] = true;
          } else if (normalized === 'no' || normalized === 'false') {
            payload[f] = false;
          } else {
            payload[f] = Boolean(value);
          }
        } else {
          payload[f] = Boolean(value);
        }
      }
    }

    // Convert int array fields
    const intArrayFields = [
      'isPrefectYears',
      'isClassLeaderYears',
      'participateForCompetitionsYears',
      'isInAnnouncingClubYears',
      'isOnStageYears',
      'participateToKatinaYears',
    ];
    for (const f of intArrayFields) {
      const value = payload[f];
      if (value !== undefined) {
        if (value === null) {
          payload[f] = [];
        } else if (Array.isArray(value)) {
          payload[f] = value
            .map((v) => Number(v))
            .filter((n) => !Number.isNaN(n));
        } else if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value) as unknown;
            if (Array.isArray(parsed)) {
              payload[f] = parsed
                .map((v) => Number(String(v)))
                .filter((n) => !Number.isNaN(n));
            } else {
              payload[f] = [];
            }
          } catch {
            payload[f] = [];
          }
        }
      }
    }

    // Validate fullName if provided and empty
    if (payload.fullName !== undefined) {
      if (
        payload.fullName === null ||
        typeof payload.fullName !== 'string' ||
        payload.fullName.trim() === ''
      ) {
        throw new BadRequestException('fullName cannot be empty');
      }
    }

    return this.prisma.prefectBoard.update({
      where: { id },
      data: normalizeFormTextFields(
        payload,
      ) as unknown as Prisma.PrefectBoardUpdateInput,
    });
  }
}

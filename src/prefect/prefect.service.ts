import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrefectDto } from './dto/create-prefect.dto';

@Injectable()
export class PrefectService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePrefectDto | Record<string, unknown>) {
    // whitelist only fields that exist on the PrefectBoard model
    const allowed = [
      'fullNameEn',
      'fullNameSi',
      'addressEn',
      'addressSi',
      'gradeEn',
      'gradeSi',
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
      'parentsNameEn',
      'parentsNameSi',
      'parentsAgreement',
      'libraryStatus',
      'specialNoteEn',
      'specialNoteSi',
      'teachersAgreement',
      'teachersAgreementFile',
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
      'studentAgreement',
      'parentsAgreement',
      'teachersAgreement',
    ];
    for (const f of booleanFields) {
      const value = payload[f];
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string') {
          payload[f] = value.toLowerCase() === 'true';
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

    // payload is a runtime-shaped object built from trusted form fields.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return this.prisma.prefectBoard.create({ data: payload as any });
  }

  async findAll() {
    return this.prisma.prefectBoard.findMany();
  }
}

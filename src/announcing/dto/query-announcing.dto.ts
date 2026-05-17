export class QueryAnnouncingDto {
  status?: 'SELECTED' | 'NOT_SELECTED' | 'PENDING';
  school?: string;
  studentAgreement?: boolean;
  name?: string;
  take?: number;
  skip?: number;
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'marks';
  orderDir?: 'asc' | 'desc';
}

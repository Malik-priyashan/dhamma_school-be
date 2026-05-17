import { Module } from '@nestjs/common';
import { StudentRequestService } from './student-request.service';
import { StudentRequestController } from './student-request.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StudentRequestController],
  providers: [StudentRequestService],
})
export class StudentRequestModule {}

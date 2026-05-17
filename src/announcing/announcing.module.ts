import { Module } from '@nestjs/common';
import { AnnouncingService } from './announcing.service';
import { AnnouncingController } from './announcing.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnnouncingController],
  providers: [AnnouncingService],
})
export class AnnouncingModule {}

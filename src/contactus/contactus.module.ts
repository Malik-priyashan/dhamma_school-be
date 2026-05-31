import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ContactUsController } from './contactus.controller';
import { ContactUsService } from './contactus.service';

@Module({
  imports: [PrismaModule],
  controllers: [ContactUsController],
  providers: [ContactUsService],
})
export class ContactUsModule {}

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ContactUsController } from './contactus.controller';
import { ContactUsService } from './contactus.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ContactUsController],
  providers: [ContactUsService],
})
export class ContactUsModule {}

import { Module } from '@nestjs/common';
import { RegistrationPaymentService } from './registration-payment.service';
import { RegistrationPaymentController } from './registration-payment.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RegistrationPaymentService],
  controllers: [RegistrationPaymentController],
})
export class RegistrationPaymentModule {}

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationPaymentDto } from './dto/create-registration-payment.dto';

@Injectable()
export class RegistrationPaymentService {
  constructor(private prisma: PrismaService) {}

  async createPayment(dto: CreateRegistrationPaymentDto) {
    if (!dto || typeof dto.amount !== 'number') {
      throw new BadRequestException('Invalid payment payload');
    }

    // Create a record of this global payment update
    const payment = await this.prisma.registrationPayment.create({
      data: {
        amount: dto.amount,
      },
    });

    return {
      message: 'New registration payment amount set successfully.',
      payment,
    };
  }

  async getLatestPaymentAmount() {
    const latestPayment = await this.prisma.registrationPayment.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    return {
      amount: latestPayment ? latestPayment.amount : 0,
    };
  }
}

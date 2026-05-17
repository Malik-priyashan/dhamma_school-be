import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { RegistrationPaymentService } from './registration-payment.service';
import { CreateRegistrationPaymentDto } from './dto/create-registration-payment.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('registration-payment')
export class RegistrationPaymentController {
  constructor(
    private readonly registrationPaymentService: RegistrationPaymentService,
  ) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  createPayment(
    @Body() createRegistrationPaymentDto: CreateRegistrationPaymentDto,
  ) {
    return this.registrationPaymentService.createPayment(
      createRegistrationPaymentDto,
    );
  }

  @Get()
  getPaymentAmount() {
    return this.registrationPaymentService.getLatestPaymentAmount();
  }
}

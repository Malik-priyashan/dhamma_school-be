import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRegistrationPaymentDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}

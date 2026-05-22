import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { StudentModule } from './student/student.module';
import { StudentRequestModule } from './student-request/student-request.module';
// Youtube module removed
import { PrefectModule } from './prefect/prefect.module';
import { AnnouncingModule } from './announcing/announcing.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RegistrationPaymentModule } from './registration-payment/registration-payment.module';
import { MarksModule } from './marks/marks.module';

@Module({
  imports: [
    PrismaModule,
    StudentModule,
    StudentRequestModule,
    PrefectModule,
    AnnouncingModule,
    AuthModule,
    UsersModule,
    RegistrationPaymentModule,
    MarksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

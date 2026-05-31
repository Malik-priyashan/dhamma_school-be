import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { StudentModule } from './student/student.module';
import { StudentRequestModule } from './student-request/student-request.module';
// Youtube module removed
import { PrefectModule } from './prefect/prefect.module';
import { AnnouncingModule } from './announcing/announcing.module';
import { NewsModule } from './news/news.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RegistrationPaymentModule } from './registration-payment/registration-payment.module';
import { MarksModule } from './marks/marks.module';
import { ContactUsModule } from './contactus/contactus.module';

@Module({
  imports: [
    PrismaModule,
    StudentModule,
    StudentRequestModule,
    PrefectModule,
    AnnouncingModule,
    NewsModule,
    EventsModule,
    AuthModule,
    UsersModule,
    RegistrationPaymentModule,
    MarksModule,
    ContactUsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

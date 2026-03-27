import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { StudentModule } from './student/student.module';
import { YoutubeModule } from './youtube/youtube.module';
import { PrefectModule } from './prefect/prefect.module';

@Module({
  imports: [PrismaModule, StudentModule, YoutubeModule, PrefectModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

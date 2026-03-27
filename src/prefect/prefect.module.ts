import { Module } from '@nestjs/common';
import { PrefectService } from './prefect.service';
import { PrefectController } from './prefect.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PrefectService],
  controllers: [PrefectController],
})
export class PrefectModule {}

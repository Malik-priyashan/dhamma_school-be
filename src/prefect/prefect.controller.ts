import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrefectService } from './prefect.service';
import { CreatePrefectDto } from './dto/create-prefect.dto';
import { UpdatePrefectDto } from './dto/update-prefect.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Roles('STUDENT', 'ADMIN')
@Controller('prefect')
export class PrefectController {
  constructor(private readonly prefectService: PrefectService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('teacherConfirmation'))
  async register(
    @UploadedFile() file?: { filename?: string; originalname?: string },
    @Body() dto?: CreatePrefectDto,
  ) {
    // if a file was uploaded, attach its filename to the DTO so it can be saved
    const data: CreatePrefectDto = dto ?? ({} as CreatePrefectDto);
    if (file) {
      const filename =
        typeof file.filename === 'string'
          ? file.filename
          : typeof file.originalname === 'string'
            ? file.originalname
            : undefined;
      if (filename) data.teachersAgreementFile = filename;
    }
    return this.prefectService.create(data);
  }

  @Get()
  async getAll(
    @Query('status') status?: string,
    @Query('grade') grade?: string,
    @Query('indexNo') indexNo?: string,
    @Query('name') name?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.prefectService.findAll({
      status,
      grade,
      indexNo,
      name,
      page,
      limit,
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePrefectDto) {
    console.log('PATCH API DTO RECEIVED:', dto);
    return this.prefectService.update(id, dto);
  }
}

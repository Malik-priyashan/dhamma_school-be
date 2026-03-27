import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrefectService } from './prefect.service';
import { CreatePrefectDto } from './dto/create-prefect.dto';

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
  async getAll() {
    return this.prefectService.findAll();
  }
}

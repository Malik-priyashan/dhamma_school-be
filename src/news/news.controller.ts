import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { QueryNewsDto } from './dto/query-news.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file?: { filename?: string; originalname?: string },
    @Body() dto?: CreateNewsDto,
  ) {
    const data: CreateNewsDto = dto ?? ({} as CreateNewsDto);
    if (file) {
      data.image = file.filename || file.originalname;
    }
    return this.newsService.create(data);
  }

  @Get()
  async findAll(@Query() query: QueryNewsDto) {
    return this.newsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.newsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file?: { filename?: string; originalname?: string },
    @Body() dto?: UpdateNewsDto,
  ) {
    const data: UpdateNewsDto = dto ?? ({} as UpdateNewsDto);
    if (file) {
      data.image = file.filename || file.originalname;
    }
    return this.newsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.newsService.remove(id);
  }
}

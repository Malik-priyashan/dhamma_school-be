import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AnnouncingService } from './announcing.service';
import { CreateAnnouncingDto } from './dto/create-announcing.dto';
import { QueryAnnouncingDto } from './dto/query-announcing.dto';
import { UpdateAnnouncingDto } from './dto/update-announcing.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Roles('STUDENT', 'ADMIN')
@Controller('announcing')
export class AnnouncingController {
  constructor(private readonly announcingService: AnnouncingService) {}

  @Post()
  async create(@Body() dto: CreateAnnouncingDto) {
    return this.announcingService.create(dto);
  }

  @Get()
  async findAll(@Query() query: QueryAnnouncingDto) {
    return this.announcingService.findAll(query);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAnnouncingDto) {
    return this.announcingService.update(id, dto);
  }
}

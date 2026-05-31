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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file?: { filename?: string; originalname?: string },
    @Body() dto?: CreateEventDto,
  ) {
    const data: CreateEventDto = dto ?? ({} as CreateEventDto);
    if (file) {
      data.image = file.filename || file.originalname;
    }
    return this.eventsService.create(data);
  }

  @Get()
  async findAll(@Query() query: QueryEventDto) {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file?: { filename?: string; originalname?: string },
    @Body() dto?: UpdateEventDto,
  ) {
    const data: UpdateEventDto = dto ?? ({} as UpdateEventDto);
    if (file) {
      data.image = file.filename || file.originalname;
    }
    return this.eventsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.eventsService.remove(id);
  }
}

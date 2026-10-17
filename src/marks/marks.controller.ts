import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { MarksService } from './marks.service';
import { CreateMarkDto } from './dto/create-mark.dto';
import { UpdateMarkDto } from './dto/update-mark.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

type AuthenticatedRequest = Request & { user: { sub: string; role: string } };

@Controller('marks')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN', 'TEACHER')
export class MarksController {
  constructor(private readonly marksService: MarksService) {}

  @Post()
  create(@Body() createMarkDto: CreateMarkDto) {
    return this.marksService.create(createMarkDto);
  }

  @Get()
  @Roles('STUDENT', 'TEACHER', 'ADMIN')
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('studentId') studentId?: string,
    @Query('year') year?: string,
    @Query('term') term?: string,
  ) {
    let ownedStudentIds: string[] | undefined;
    if (req.user.role === 'STUDENT') {
      ownedStudentIds = await this.marksService.findOwnedStudentIds(req.user.sub);
      if (studentId && studentId !== req.user.sub && !ownedStudentIds.includes(studentId)) {
        throw new ForbiddenException('Student record is not yours');
      }
      if (studentId === req.user.sub) studentId = undefined;
    }
    return this.marksService.findAll(
      studentId,
      year ? Number(year) : undefined,
      term,
      ownedStudentIds,
    );
  }

  @Get(':id')
  @Roles('STUDENT', 'TEACHER', 'ADMIN')
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const mark = await this.marksService.findOne(id);
    if (req.user.role === 'STUDENT' && mark.student?.userId !== req.user.sub) {
      throw new ForbiddenException('Mark record is not yours');
    }
    return mark;
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateMarkDto: UpdateMarkDto,
  ) {
    return this.marksService.update(id, updateMarkDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.marksService.remove(id);
  }
}

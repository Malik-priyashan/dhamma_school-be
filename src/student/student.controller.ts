import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN', 'TEACHER')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @UseInterceptors(FileInterceptor('studentImage'))
  async create(
    @UploadedFile() file: { filename?: string; originalname?: string },
    @Body() dto: CreateStudentDto,
  ) {
    if (file) {
      dto.studentImage = file.filename || file.originalname;
    }
    return this.studentService.create(dto);
  }

  @Get()
  async findAll(
    @Query('grade') grade?: string,
    @Query('name') name?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.studentService.findAll(grade, name, page, limit);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.studentService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('studentImage'))
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file: { filename?: string; originalname?: string },
    @Body() dto: UpdateStudentDto,
  ) {
    if (file) {
      dto.studentImage = file.filename || file.originalname;
    }
    return this.studentService.update(id, dto);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageUploadOptions } from '../common/image-upload';
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
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('studentImage', imageUploadOptions))
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
    @Req() req: Request & { user?: { role: string } },
    @Query('grade') grade?: string,
    @Query('name') name?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.studentService.findAll(grade, name, page, limit);
    if (req.user?.role !== 'TEACHER') return result;
    return {
      ...result,
      data: result.data.map((student) => ({
        id: student.id,
        fullNameWithSurname: student.fullNameWithSurname,
        nameWithInitials: student.nameWithInitials,
        grade: student.grade,
        studentImage: student.studentImage,
      })),
    };
  }

  @Get('my-students')
  @Roles('STUDENT', 'TEACHER', 'ADMIN')
  async findMyStudents(@Req() req: Request & { user?: { sub?: string } }) {
    const userId = req.user?.sub;
    if (!userId) {
      return [];
    }

    return this.studentService.findMyStudents(userId);
  }

  @Get(':id')
  @Roles('ADMIN')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.studentService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('studentImage', imageUploadOptions))
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

  @Post('promote-grades')
  @Roles('ADMIN')
  async promoteGrades() {
    return this.studentService.promoteGrades();
  }
}

import { Body, Controller, Get, Post } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('register')
  async register(@Body() dto: CreateStudentDto) {
    return this.studentService.create(dto);
  }

  @Get()
  async findAll() {
    return this.studentService.findAll();
  }
}

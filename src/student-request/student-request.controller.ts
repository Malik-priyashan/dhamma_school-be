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
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentRequestService } from './student-request.service';
import { CreateStudentRequestDto } from './dto/create-student-request.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Roles('STUDENT', 'ADMIN')
@Controller('student-request')
export class StudentRequestController {
  constructor(private readonly studentService: StudentRequestService) {}

  @Post('submit')
  @UseInterceptors(FileInterceptor('studentImage'))
  async submit(
    @Req() req: Request & { user?: { sub: string; role: string } },
    @UploadedFile() file: { filename?: string; originalname?: string },
    @Body() dto: CreateStudentRequestDto,
  ) {
    if (file) {
      dto.studentImage = file.filename || file.originalname;
    }
    // If the authenticated user is a STUDENT, automatically associate their userId
    if (req.user && req.user.role === 'STUDENT') {
      dto.userId = req.user.sub;
    }
    return this.studentService.createRequest(dto);
  }

  @Get()
  async findAllRequests(
    @Query('status') status?: string,
    @Query('createdDate') createdDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.studentService.findAllRequests({
      status,
      createdDate,
      page,
      limit,
    });
  }

  @Patch(':id/accept')
  @Roles('ADMIN')
  async acceptRequest(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.studentService.acceptRequest(id);
  }

  @Patch(':id/reject')
  @Roles('ADMIN')
  async rejectRequest(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.studentService.rejectRequest(id);
  }
}

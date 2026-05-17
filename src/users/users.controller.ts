import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('teachers')
  findAllTeachers() {
    return this.usersService.findAllTeachers();
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.usersService.updateStatus(id, isActive);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}

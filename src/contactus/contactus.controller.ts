import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { enforceRateLimit, requestIp } from '../common/rate-limit';
import type { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateContactUsDto } from './dto/create-contactus.dto';
import { UpdateContactUsDto } from './dto/update-contactus.dto';
import { ContactUsService } from './contactus.service';

@Controller('contact-us')
export class ContactUsController {
  constructor(
    private readonly contactUsService: ContactUsService,
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateContactUsDto) {
    await enforceRateLimit(this.prisma, 'contact-ip', requestIp(req), 30, 60 * 60_000);
    const actor = await this.resolveUser(req);
    return this.contactUsService.create(dto, actor?.id, actor?.role === 'ADMIN');
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findAll() {
    return this.contactUsService.findAll();
  }

  @Get('my-messages')
  @UseGuards(AuthGuard)
  async findMine(@Req() req: Request) {
    const userId = await this.resolveUserId(req);
    if (!userId) {
      return [];
    }

    return this.contactUsService.findByUser(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.contactUsService.findOne(id);
  }

  @Patch(':id/read')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async markThreadRead(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateContactUsDto,
  ) {
    return this.contactUsService.markThreadRead(id, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateContactUsDto,
  ) {
    return this.contactUsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.contactUsService.remove(id);
  }

  @Patch('my-messages/:id')
  @UseGuards(AuthGuard)
  async updateMine(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateContactUsDto,
  ) {
    const userId = await this.resolveUserId(req);
    if (!userId) {
      return null;
    }

    return this.contactUsService.updateMine(userId, id, dto);
  }

  @Delete('my-messages/:id')
  @UseGuards(AuthGuard)
  async removeMine(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const userId = await this.resolveUserId(req);
    if (!userId) {
      return null;
    }

    return this.contactUsService.removeMine(userId, id);
  }

  @Delete('my-messages')
  @UseGuards(AuthGuard)
  async removeMyThread(@Req() req: Request) {
    const userId = await this.resolveUserId(req);
    if (!userId) {
      return null;
    }

    return this.contactUsService.removeMyThread(userId);
  }

  @Delete('thread/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async removeThreadByMessageId(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.contactUsService.removeThreadByMessageId(id);
  }

  private async resolveUserId(request: Request): Promise<string | undefined> {
    return (await this.resolveUser(request))?.id;
  }

  private async resolveUser(
    request: Request,
  ): Promise<{ id: string; role: string } | undefined> {
    const cookies = (request.cookies || {}) as Record<string, string | undefined>;
    let token = cookies.accessToken;
    if (!token) {
      const [type, bearer] = request.headers.authorization?.split(' ') ?? [];
      token = type === 'Bearer' ? bearer : undefined;
    }
    if (!token) return undefined;
    try {
      const user = await this.authService.getMe(token);
      return { id: user.id, role: user.role };
    } catch {
      return undefined;
    }
  }
}

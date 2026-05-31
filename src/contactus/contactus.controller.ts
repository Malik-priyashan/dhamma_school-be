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
import { JwtService } from '@nestjs/jwt';
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
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateContactUsDto) {
    const userId = await this.resolveUserId(req);
    return this.contactUsService.create(dto, userId);
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
    const cookies = (request.cookies || {}) as Record<
      string,
      string | undefined
    >;
    let token = cookies.accessToken;

    if (!token) {
      const [type, authHeaderToken] =
        request.headers.authorization?.split(' ') ?? [];
      token = type === 'Bearer' ? authHeaderToken : undefined;
    }

    if (!token) {
      return undefined;
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(
        token,
        {
          secret: process.env.JWT_SECRET || 'super-secret-default-key',
        },
      );
      return payload.sub;
    } catch {
      return undefined;
    }
  }
}

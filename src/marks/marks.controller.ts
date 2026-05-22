import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MarksService } from './marks.service';
import { CreateMarkDto } from './dto/create-mark.dto';
import { UpdateMarkDto } from './dto/update-mark.dto';

@Controller('marks')
export class MarksController {
  constructor(private readonly marksService: MarksService) {}

  @Post()
  create(@Body() createMarkDto: CreateMarkDto) {
    return this.marksService.create(createMarkDto);
  }

  @Get()
  findAll(
    @Query('studentId') studentId?: string,
    @Query('year') year?: string,
    @Query('term') term?: string,
  ) {
    return this.marksService.findAll(
      studentId,
      year ? parseInt(year, 10) : undefined,
      term,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMarkDto: UpdateMarkDto) {
    return this.marksService.update(id, updateMarkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marksService.remove(id);
  }
}

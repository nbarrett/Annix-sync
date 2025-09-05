import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SteelSpecificationService } from './steel-specification.service';
import { CreateSteelSpecificationDto } from './dto/create-steel-specification.dto';
import { UpdateSteelSpecificationDto } from './dto/update-steel-specification.dto';

@Controller('steel-specification')
export class SteelSpecificationController {
  constructor(private readonly steelSpecificationService: SteelSpecificationService) {}

  @Post()
  create(@Body() createSteelSpecificationDto: CreateSteelSpecificationDto) {
    return this.steelSpecificationService.create(createSteelSpecificationDto);
  }

  @Get()
  findAll() {
    return this.steelSpecificationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.steelSpecificationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSteelSpecificationDto: UpdateSteelSpecificationDto) {
    return this.steelSpecificationService.update(+id, updateSteelSpecificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.steelSpecificationService.remove(+id);
  }
}

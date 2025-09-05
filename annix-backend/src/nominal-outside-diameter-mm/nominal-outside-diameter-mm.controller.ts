import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { NominalOutsideDiameterMmService } from './nominal-outside-diameter-mm.service';
import { CreateNominalOutsideDiameterMmDto } from './dto/create-nominal-outside-diameter-mm.dto';
import { UpdateNominalOutsideDiameterMmDto } from './dto/update-nominal-outside-diameter-mm.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('nominal-outside-diameter-mm')
export class NominalOutsideDiameterMmController {
  constructor(private readonly nominalOutsideDiameterMmService: NominalOutsideDiameterMmService) {}

  @Post()
  @ApiOperation({ summary: 'Create a nominal outside diameter' })
  @ApiResponse({ status: 201, description: 'Successfully created' })
  @ApiResponse({ status: 400, description: 'Duplicate or invalid data' })
  create(@Body() createNominalOutsideDiameterMmDto: CreateNominalOutsideDiameterMmDto) {
    return this.nominalOutsideDiameterMmService.create(createNominalOutsideDiameterMmDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all nominal outside diameters' })
  findAll() {
    return this.nominalOutsideDiameterMmService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a nominal outside diameter by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.nominalOutsideDiameterMmService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a nominal outside diameter' })
  @ApiResponse({ status: 400, description: 'Duplicate or invalid data' })
  update(@Param('id', ParseIntPipe) id: string, @Body() updateNominalOutsideDiameterMmDto: UpdateNominalOutsideDiameterMmDto) {
    return this.nominalOutsideDiameterMmService.update(+id, updateNominalOutsideDiameterMmDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a nominal outside diameter' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.nominalOutsideDiameterMmService.remove(+id);
  }
}

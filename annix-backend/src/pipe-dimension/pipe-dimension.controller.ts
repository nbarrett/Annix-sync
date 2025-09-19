import { Controller, Get, Post, Body, Param, Delete, Patch, ParseIntPipe } from '@nestjs/common';
import { PipeDimensionService } from './pipe-dimension.service';
import { PipeDimension } from './entities/pipe-dimension.entity';
import { CreatePipeDimensionDto } from './dto/create-pipe-dimension.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdatePipeDimensionDto } from './dto/update-pipe-dimension.dto';

@Controller('pipe-dimensions')
export class PipeDimensionController {
  constructor(private readonly pipeDimensionService: PipeDimensionService) {}

  @Post(':nominalId')
  @ApiOperation({ summary: 'Create a pipe dimension for a certain nominalId' })
  @ApiBody({ type: CreatePipeDimensionDto})
  @ApiResponse({ status: 201, description: 'Successfully created' })
  @ApiResponse({ status: 400, description: 'Duplicate or invalid data' })
  async create(@Param('nominalId', ParseIntPipe) nominalId: number, @Body() createPipeDimensionDto: CreatePipeDimensionDto,) {
    return this.pipeDimensionService.create(nominalId, createPipeDimensionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pipe dimensions' })
  @ApiResponse({ status: 200, description: 'List of pipe dimensions', type: [PipeDimension] })
  async findAll() {
    return this.pipeDimensionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get all pipe dimensions by ID' })
  @ApiResponse({ status: 200, description: 'User found', type: PipeDimension })
  @ApiResponse({ status: 404, description: 'Pipe dimension not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID parameter' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pipeDimensionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a pipe dimension' })
  @ApiResponse({ status: 200, description: 'Pipe dimension updated', type: PipeDimension })
  @ApiResponse({ status: 400, description: 'Duplicate or invalid data' })
  @ApiResponse({ status: 404, description: 'Pipe dimension not found' })
  // @ApiResponse({ status: 400, description: 'Invalid ID parameter' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatePipeDimensionDto: UpdatePipeDimensionDto,) {
    return this.pipeDimensionService.update(id, updatePipeDimensionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pipe dimension' })
  @ApiResponse({ status: 200, description: 'Pipe dimension deleted successfully' })
  @ApiResponse({ status: 404, description: 'Pipe dimension not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID parameter' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.pipeDimensionService.remove(id);
  }
}


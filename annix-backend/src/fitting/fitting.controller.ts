import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FittingService } from './fitting.service';
import { CreateFittingDto } from './dto/create-fitting.dto';
import { UpdateFittingDto } from './dto/update-fitting.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('fittings')
@Controller('fitting')
export class FittingController {
  constructor(private readonly fittingService: FittingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new fitting' })
  @ApiResponse({ status: 201, description: 'Successfully created' })
  @ApiResponse({ status: 400, description: 'Duplicate or invalid data' })
  create(@Body() createFittingDto: CreateFittingDto) {
    return this.fittingService.create(createFittingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all fittings' })
  @ApiResponse({ status: 200, description: 'List of fittings retrieved successfully' })
  findAll() {
    return this.fittingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a fitting by ID' })
  @ApiResponse({ status: 200, description: 'Fittings retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Fittings not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID parameter' })
  findOne(@Param('id') id: string) {
    return this.fittingService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a fitting' })
  @ApiResponse({ status: 200, description: 'Fittings updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or duplicate fittings' })
  @ApiResponse({ status: 404, description: 'Fittings not found' })
  update(@Param('id') id: string, @Body() updateFittingDto: UpdateFittingDto) {
    return this.fittingService.update(+id, updateFittingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a fitting' })
  @ApiResponse({ status: 200, description: 'Fittings deleted successfully' })
  @ApiResponse({ status: 404, description: 'Fittings not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID parameter' })
  remove(@Param('id') id: string) {
    return this.fittingService.remove(+id);
  }
}

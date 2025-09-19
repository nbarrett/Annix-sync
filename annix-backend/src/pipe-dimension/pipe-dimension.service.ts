import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PipeDimension } from './entities/pipe-dimension.entity';
import { NominalOutsideDiameterMm } from '../nominal-outside-diameter-mm/entities/nominal-outside-diameter-mm.entity';
import { IsNull } from 'typeorm';
import { CreatePipeDimensionDto } from './dto/create-pipe-dimension.dto';
import { UpdatePipeDimensionDto } from './dto/update-pipe-dimension.dto';

@Injectable()
export class PipeDimensionService {
  constructor(
    @InjectRepository(PipeDimension)
    private readonly pipeDimensionRepo: Repository<PipeDimension>,

    @InjectRepository(NominalOutsideDiameterMm)
    private readonly nominalRepo: Repository<NominalOutsideDiameterMm>,
  ) {}

  async create(nominalId: number, createPipeDimensionDto: CreatePipeDimensionDto,
  ): Promise<PipeDimension> {
    const nominal = await this.nominalRepo.findOne({ where: { id: nominalId } });
    if (!nominal) {
      throw new NotFoundException(
        `NominalOutsideDiameterMm with id ${nominalId} not found`,
      );
    }

    const exists = await this.pipeDimensionRepo.findOne({
      where: {
        nominalOutsideDiameter: { id: nominalId },
        wall_thickness_mm: createPipeDimensionDto.wall_thickness_mm,
        internal_diameter_mm:
          createPipeDimensionDto.internal_diameter_mm === null ? IsNull() : createPipeDimensionDto.internal_diameter_mm,
        mass_kgm: createPipeDimensionDto.mass_kgm,
        schedule_designation:
          createPipeDimensionDto.schedule_designation === null ? IsNull() : createPipeDimensionDto.schedule_designation,
        schedule_number:
          createPipeDimensionDto.schedule_number === null ? IsNull() : createPipeDimensionDto.schedule_number,
      },
      relations: ['nominalOutsideDiameter'],
    });

    if (exists) {
      throw new BadRequestException(
        `PipeDimension with wall thickness ${createPipeDimensionDto.wall_thickness_mm} mm, ` +
          `internal diameter ${createPipeDimensionDto.internal_diameter_mm ?? 'null'} mm, ` +
          `mass ${createPipeDimensionDto.mass_kgm} kg/m, ` +
          `schedule ${createPipeDimensionDto.schedule_designation ?? 'null'} ${
            createPipeDimensionDto.schedule_number ?? ''
          } already exists for NominalOutsideDiameterMm ID ${nominalId}`,
      );
    }

    const dimension = this.pipeDimensionRepo.create({
      ...createPipeDimensionDto,
      nominalOutsideDiameter: nominal,
    });

    return this.pipeDimensionRepo.save(dimension);
  }


  async findAll(): Promise<PipeDimension[]> {
    return this.pipeDimensionRepo.find({relations: ['nominalOutsideDiameter'],});
  }

  async findOne(id: number): Promise<PipeDimension> {
    const dimension = await this.pipeDimensionRepo.findOne({
      where: { id },
      relations: ['nominalOutsideDiameter'],
    });
    if (!dimension) {
      throw new NotFoundException(`PipeDimension with id ${id} not found`);
    }
    return dimension;
  }

  async update(id: number, updatePipeDimensionDto: UpdatePipeDimensionDto): Promise<PipeDimension> {
    const dimension = await this.findOne(id);

    if (
      updatePipeDimensionDto.wall_thickness_mm !== undefined &&
      updatePipeDimensionDto.mass_kgm !== undefined
    ) {
      const exists = await this.pipeDimensionRepo.findOne({
        where: {
          nominalOutsideDiameter: { id: dimension.nominalOutsideDiameter.id },
          wall_thickness_mm: updatePipeDimensionDto.wall_thickness_mm,
          internal_diameter_mm:
            updatePipeDimensionDto.internal_diameter_mm === undefined
              ? dimension.internal_diameter_mm ?? IsNull()
              : updatePipeDimensionDto.internal_diameter_mm === null
              ? IsNull()
              : updatePipeDimensionDto.internal_diameter_mm,
          mass_kgm: updatePipeDimensionDto.mass_kgm,
          schedule_designation:
            updatePipeDimensionDto.schedule_designation === undefined
              ? dimension.schedule_designation ?? IsNull()
              : updatePipeDimensionDto.schedule_designation === null
              ? IsNull()
              : updatePipeDimensionDto.schedule_designation,
          schedule_number:
            updatePipeDimensionDto.schedule_number === undefined
              ? dimension.schedule_number ?? IsNull()
              : updatePipeDimensionDto.schedule_number === null
              ? IsNull()
              : updatePipeDimensionDto.schedule_number,
        },
        relations: ['nominalOutsideDiameter'],
      });

      if (exists && exists.id !== id) {
        throw new BadRequestException(
          `PipeDimension with wall thickness ${updatePipeDimensionDto.wall_thickness_mm ?? dimension.wall_thickness_mm} mm, ` +
            `internal diameter ${
              updatePipeDimensionDto.internal_diameter_mm ?? dimension.internal_diameter_mm ?? 'null'
            } mm, ` +
            `mass ${updatePipeDimensionDto.mass_kgm ?? dimension.mass_kgm} kg/m, ` +
            `schedule ${updatePipeDimensionDto.schedule_designation ?? dimension.schedule_designation ?? 'null'} ` +
            `${updatePipeDimensionDto.schedule_number ?? dimension.schedule_number ?? ''} ` +
            `already exists for NominalOutsideDiameterMm ID ${dimension.nominalOutsideDiameter.id}`,
        );
      }
    }

    Object.assign(dimension, updatePipeDimensionDto);
    return this.pipeDimensionRepo.save(dimension);
  }

  async remove(id: number): Promise<void> {
    const result = await this.pipeDimensionRepo.delete(id);
    if (result.affected === 0) 
      throw new NotFoundException(`PipeDimension #${id} not found`);
  }
}

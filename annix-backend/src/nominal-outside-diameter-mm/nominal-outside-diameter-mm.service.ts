import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNominalOutsideDiameterMmDto } from './dto/create-nominal-outside-diameter-mm.dto';
import { UpdateNominalOutsideDiameterMmDto } from './dto/update-nominal-outside-diameter-mm.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { NominalOutsideDiameterMm } from './entities/nominal-outside-diameter-mm.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NominalOutsideDiameterMmService {
  constructor(
    @InjectRepository(NominalOutsideDiameterMm)
    private readonly repository: Repository<NominalOutsideDiameterMm>,
  ) {}

  async create(createNominalOutsideDiameterMmDto: CreateNominalOutsideDiameterMmDto) {
    const exists = await this.repository.findOneBy({
      nominal_diameter_mm: createNominalOutsideDiameterMmDto.nominal_diameter_mm,
      outside_diameter_mm: createNominalOutsideDiameterMmDto.outside_diameter_mm,
    });

    if (exists) {
      throw new BadRequestException(
        `Nominal diameter ${createNominalOutsideDiameterMmDto.nominal_diameter_mm} mm with outside diameter ${createNominalOutsideDiameterMmDto.outside_diameter_mm} mm already exists`,
      );
    }

    const entity = this.repository.create(createNominalOutsideDiameterMmDto);
    return this.repository.save(entity);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const entity = await this.repository.findOneBy({ id });
    if (!entity) throw new NotFoundException(`NominalOutsideDiameter #${id} not found`);
    return entity;
  }

  async update(id: number, updateNominalOutsideDiameterMmDto: UpdateNominalOutsideDiameterMmDto) {
    const entity = await this.findOne(id);

    // Optional duplicate check if both fields are provided
    if (updateNominalOutsideDiameterMmDto.nominal_diameter_mm && updateNominalOutsideDiameterMmDto.outside_diameter_mm) {
      const exists = await this.repository.findOneBy({
        nominal_diameter_mm: updateNominalOutsideDiameterMmDto.nominal_diameter_mm,
        outside_diameter_mm: updateNominalOutsideDiameterMmDto.outside_diameter_mm,
      });

      if (exists && exists.id !== id) {
        throw new BadRequestException(
          `Nominal diameter ${updateNominalOutsideDiameterMmDto.nominal_diameter_mm} mm with outside diameter ${updateNominalOutsideDiameterMmDto.outside_diameter_mm} mm already exists`,
        );
      }
    }

    Object.assign(entity, updateNominalOutsideDiameterMmDto);
    return this.repository.save(entity);
  }

  async remove(id: number) {
    const result = await this.repository.delete(id);
    if (result.affected === 0) 
      throw new NotFoundException(`NominalOutsideDiameter #${id} not found`);
  }
}

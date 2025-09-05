import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SteelSpecification } from './entities/steel-specification.entity';
import { CreateSteelSpecificationDto } from './dto/create-steel-specification.dto';
import { UpdateSteelSpecificationDto } from './dto/update-steel-specification.dto';

@Injectable()
export class SteelSpecificationService {
  constructor(
    @InjectRepository(SteelSpecification)
    private readonly steelSpecificationRepository: Repository<SteelSpecification>,
  ) {}

  async create(createSteelSpecificationDto: CreateSteelSpecificationDto): Promise<SteelSpecification> {
    const existing = await this.steelSpecificationRepository.findOneBy({
      steelSpecName: createSteelSpecificationDto.steelSpecName,
    });

    if (existing) {
      throw new BadRequestException(
        `Steel specification with name "${createSteelSpecificationDto.steelSpecName}" already exists`
      );
    }

    const steelSpecification = this.steelSpecificationRepository.create({
      steelSpecName: createSteelSpecificationDto.steelSpecName,
    });
    return this.steelSpecificationRepository.save(steelSpecification);
  }

  async findAll(): Promise<SteelSpecification[]> {
    return this.steelSpecificationRepository.find();
  }

  async findOne(id: number): Promise<SteelSpecification> {
    const steelSpecification = await this.steelSpecificationRepository.findOneBy({ id });
    if (!steelSpecification) {
      throw new NotFoundException(`SteelSpecification #${id} not found`);
    }
    return steelSpecification;
  }

  async update(id: number, updateSteelSpecificationDto: UpdateSteelSpecificationDto): Promise<SteelSpecification> {
    const steelSpecification = await this.findOne(id);
    Object.assign(steelSpecification, updateSteelSpecificationDto);
    return this.steelSpecificationRepository.save(steelSpecification);
  }

  async remove(id: number): Promise<void> {
    const result = await this.steelSpecificationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`SteelSpecification #${id} not found`);
    }
  }
}

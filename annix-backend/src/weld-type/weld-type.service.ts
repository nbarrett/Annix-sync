import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WeldType } from './entities/weld-type.entity';
import { CreateWeldTypeDto } from './dto/create-weld-type.dto';
import { UpdateWeldTypeDto } from './dto/update-weld-type.dto';

@Injectable()
export class WeldTypeService {
  constructor(
    @InjectRepository(WeldType)
    private readonly weldTypeRepo: Repository<WeldType>,
  ) {}

  async create(dto: CreateWeldTypeDto): Promise<WeldType> {
    const exists = await this.weldTypeRepo.findOne({ where: { code: dto.code } });
    if (exists) {
      throw new BadRequestException(`WeldType with code "${dto.code}" already exists`);
    }

    const weldType = this.weldTypeRepo.create({
      code: dto.code,
      description: dto.description,
    });
    return this.weldTypeRepo.save(weldType);
  }

  async findAll(): Promise<WeldType[]> {
    return this.weldTypeRepo.find();
  }

  async findOne(id: number): Promise<WeldType> {
    const weldType = await this.weldTypeRepo.findOne({ where: { id } });
    if (!weldType) throw new NotFoundException(`WeldType ${id} not found`);
    return weldType;
  }

  async update(id: number, dto: UpdateWeldTypeDto): Promise<WeldType> {
    const weldType = await this.findOne(id);
    Object.assign(weldType, dto);
    return this.weldTypeRepo.save(weldType);
  }

  async remove(id: number): Promise<void> {
    const weldType = await this.findOne(id);
    await this.weldTypeRepo.remove(weldType);
  }
}

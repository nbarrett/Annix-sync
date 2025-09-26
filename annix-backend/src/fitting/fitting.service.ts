// import { Injectable } from '@nestjs/common';
// import { CreateFittingDto } from './dto/create-fitting.dto';
// import { UpdateFittingDto } from './dto/update-fitting.dto';

// @Injectable()
// export class FittingService {
//   create(createFittingDto: CreateFittingDto) {
//     return 'This action adds a new fitting';
//   }

//   findAll() {
//     return `This action returns all fitting`;
//   }

//   findOne(id: number) {
//     return `This action returns a #${id} fitting`;
//   }

//   update(id: number, updateFittingDto: UpdateFittingDto) {
//     return `This action updates a #${id} fitting`;
//   }

//   remove(id: number) {
//     return `This action removes a #${id} fitting`;
//   }
// }
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Fitting } from './entities/fitting.entity';
import { CreateFittingDto } from './dto/create-fitting.dto';
import { UpdateFittingDto } from './dto/update-fitting.dto';

@Injectable()
export class FittingService {
  constructor(
    @InjectRepository(Fitting)
    private readonly fittingRepo: Repository<Fitting>,
  ) {}

  async create(dto: CreateFittingDto): Promise<Fitting> {
    // Optional: check duplicate by combination of type+steelSpec
    const existing = await this.fittingRepo.findOne({
      where: { fittingType: { id: dto.fittingTypeId }, steelSpecification: { id: dto.steelSpecificationId } },
    });
    if (existing) {
      throw new BadRequestException('Fitting with this type and steel specification already exists');
    }

    const fitting = this.fittingRepo.create({
      steelSpecification: { id: dto.steelSpecificationId },
      fittingType: { id: dto.fittingTypeId },
      // variants: dto.variants?.map(v => this.fittingVariantRepo.create(v)),
    });

    return this.fittingRepo.save(fitting);
  }

  async findAll(): Promise<Fitting[]> {
    return this.fittingRepo.find({ relations: ['variants', 'fittingType', 'steelSpecification'] });
  }

  async findOne(id: number): Promise<Fitting> {
    const fitting = await this.fittingRepo.findOne({
      where: { id },
      relations: ['variants', 'fittingType', 'steelSpecification'],
    });
    if (!fitting) throw new NotFoundException(`Fitting ${id} not found`);
    return fitting;
  }

  async update(id: number, dto: UpdateFittingDto): Promise<Fitting> {
    const fitting = await this.findOne(id);
    Object.assign(fitting, dto);
    return this.fittingRepo.save(fitting);
  }

  async remove(id: number): Promise<void> {
    const fitting = await this.findOne(id);
    await this.fittingRepo.remove(fitting);
  }
}

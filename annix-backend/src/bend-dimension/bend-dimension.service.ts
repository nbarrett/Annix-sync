import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NbNpsLookup } from 'src/nb-nps-lookup/entities/nb-nps-lookup.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BendDimensionService {
  constructor(
    @InjectRepository(NbNpsLookup)
    private readonly lookupRepo: Repository<NbNpsLookup>,
  ) {}    

  async calculate(nbMm: number, degree: number, multiplier: number): Promise<number> {
    const lookup = await this.lookupRepo.findOne({ where: { nb_mm: nbMm } });
    if (!lookup) {
      throw new NotFoundException(`NB ${nbMm} mm not found`);
    }

    const radians = (degree / 180) * (Math.PI / 2);
    const radius = multiplier * lookup.nps_inch * 25.4;
    const result = Math.tan(radians) * radius;

    return Math.round(result * 10) / 10; // round to 1 decimal
  }
}

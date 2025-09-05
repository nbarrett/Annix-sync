import { Test, TestingModule } from '@nestjs/testing';
import { SteelSpecificationService } from './steel-specification.service';

describe('SteelSpecificationService', () => {
  let service: SteelSpecificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SteelSpecificationService],
    }).compile();

    service = module.get<SteelSpecificationService>(SteelSpecificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

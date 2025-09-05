import { Test, TestingModule } from '@nestjs/testing';
import { NominalOutsideDiameterMmService } from './nominal-outside-diameter-mm.service';

describe('NominalOutsideDiameterMmService', () => {
  let service: NominalOutsideDiameterMmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NominalOutsideDiameterMmService],
    }).compile();

    service = module.get<NominalOutsideDiameterMmService>(NominalOutsideDiameterMmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

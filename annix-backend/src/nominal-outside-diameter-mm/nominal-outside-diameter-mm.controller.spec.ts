import { Test, TestingModule } from '@nestjs/testing';
import { NominalOutsideDiameterMmController } from './nominal-outside-diameter-mm.controller';
import { NominalOutsideDiameterMmService } from './nominal-outside-diameter-mm.service';

describe('NominalOutsideDiameterMmController', () => {
  let controller: NominalOutsideDiameterMmController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NominalOutsideDiameterMmController],
      providers: [NominalOutsideDiameterMmService],
    }).compile();

    controller = module.get<NominalOutsideDiameterMmController>(NominalOutsideDiameterMmController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SteelSpecificationController } from './steel-specification.controller';
import { SteelSpecificationService } from './steel-specification.service';

describe('SteelSpecificationController', () => {
  let controller: SteelSpecificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SteelSpecificationController],
      providers: [SteelSpecificationService],
    }).compile();

    controller = module.get<SteelSpecificationController>(SteelSpecificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

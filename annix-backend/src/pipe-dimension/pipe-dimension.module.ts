import { Module } from '@nestjs/common';
import { PipeDimensionService } from './pipe-dimension.service';
import { PipeDimensionController } from './pipe-dimension.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PipeDimension } from './entities/pipe-dimension.entity';
import { NominalOutsideDiameterMm } from 'src/nominal-outside-diameter-mm/entities/nominal-outside-diameter-mm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PipeDimension, NominalOutsideDiameterMm])],
  providers: [PipeDimensionService],
  controllers: [PipeDimensionController],
  exports: [PipeDimensionService],
})
export class PipeDimensionModule {}

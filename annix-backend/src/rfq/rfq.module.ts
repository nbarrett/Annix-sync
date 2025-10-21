import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RfqController } from './rfq.controller';
import { RfqService } from './rfq.service';
import { Rfq } from './entities/rfq.entity';
import { RfqItem } from './entities/rfq-item.entity';
import { StraightPipeRfq } from './entities/straight-pipe-rfq.entity';
import { User } from '../user/entities/user.entity';
import { SteelSpecification } from '../steel-specification/entities/steel-specification.entity';
import { PipeDimension } from '../pipe-dimension/entities/pipe-dimension.entity';
import { FlangeStandard } from '../flange-standard/entities/flange-standard.entity';
import { FlangePressureClass } from '../flange-pressure-class/entities/flange-pressure-class.entity';
import { NbNpsLookup } from '../nb-nps-lookup/entities/nb-nps-lookup.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Rfq,
      RfqItem,
      StraightPipeRfq,
      User,
      SteelSpecification,
      PipeDimension,
      FlangeStandard,
      FlangePressureClass,
      NbNpsLookup,
    ]),
  ],
  controllers: [RfqController],
  providers: [RfqService],
  exports: [RfqService],
})
export class RfqModule {}

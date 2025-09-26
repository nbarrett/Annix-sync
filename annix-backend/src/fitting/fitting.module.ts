import { Module } from '@nestjs/common';
import { FittingService } from './fitting.service';
import { FittingController } from './fitting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fitting } from './entities/fitting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fitting]),
  ],
  controllers: [FittingController],
  providers: [FittingService],
  exports: [FittingService],
})
export class FittingModule {}

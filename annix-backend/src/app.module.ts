import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SteelSpecificationModule } from './steel-specification/steel-specification.module';
import { NominalOutsideDiameterMmModule } from './nominal-outside-diameter-mm/nominal-outside-diameter-mm.module';
import { UserModule } from './user/user.module';
import { UserRolesModule } from './user-roles/user-roles.module';
import { AuthModule } from './auth/auth.module';
import { PipeDimensionModule } from './pipe-dimension/pipe-dimension.module';
import { PipePressureModule } from './pipe-pressure/pipe-pressure.module';
import { AngleRangeModule } from './angle-range/angle-range.module';
import { FittingModule } from './fitting/fitting.module';
import { FittingBoreModule } from './fitting-bore/fitting-bore.module';
import { FittingDimensionModule } from './fitting-dimension/fitting-dimension.module';
import { FittingTypeModule } from './fitting-type/fitting-type.module';
import { FittingVariantModule } from './fitting-variant/fitting-variant.module';
import typeormConfig from './config/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      ...typeormConfig(),
    }),
    SteelSpecificationModule,
    NominalOutsideDiameterMmModule,
    UserModule,
    UserRolesModule,
    AuthModule,
    PipeDimensionModule,
    PipePressureModule,
    AngleRangeModule,
    FittingModule,
    FittingBoreModule,
    FittingDimensionModule,
    FittingTypeModule,
    FittingVariantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

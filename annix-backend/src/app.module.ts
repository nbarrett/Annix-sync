import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import typeorm from './config/typeorm';

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   load: [typeorm]
    // }),
    // TypeOrmModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService): TypeOrmModuleOptions => (configService.get<TypeOrmModuleOptions>('typeorm')!)
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWeldTypeDto {
  @ApiProperty({ example: 'FWP', description: 'Weld type code (short identifier)' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Flange Weld Pipes (Over 2.5m)', description: 'Full description of the weld type' })
  @IsString()
  @IsNotEmpty()
  description: string;
}

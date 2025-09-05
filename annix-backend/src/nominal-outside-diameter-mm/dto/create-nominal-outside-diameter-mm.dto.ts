import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNominalOutsideDiameterMmDto {
    @ApiProperty({ description: 'Nominal diameter in mm', example: 50 })
    @IsNumber()
    @IsNotEmpty()
    nominal_diameter_mm: number;

    @ApiProperty({ description: 'Outside diameter in mm', example: 60.32 })
    @IsNumber()
    @IsNotEmpty()
    outside_diameter_mm: number;
}

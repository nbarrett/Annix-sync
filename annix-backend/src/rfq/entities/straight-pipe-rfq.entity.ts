import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { RfqItem } from './rfq-item.entity';
import { SteelSpecification } from '../../steel-specification/entities/steel-specification.entity';
import { FlangeStandard } from '../../flange-standard/entities/flange-standard.entity';
import { FlangePressureClass } from '../../flange-pressure-class/entities/flange-pressure-class.entity';
import { PipeDimension } from '../../pipe-dimension/entities/pipe-dimension.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum LengthUnit {
  METERS = 'meters',
  FEET = 'feet',
}

export enum QuantityType {
  TOTAL_LENGTH = 'total_length',
  NUMBER_OF_PIPES = 'number_of_pipes',
}

export enum ScheduleType {
  SCHEDULE = 'schedule',
  WALL_THICKNESS = 'wall_thickness',
}

@Entity('straight_pipe_rfqs')
export class StraightPipeRfq {
  @ApiProperty({ description: 'Primary key', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Nominal bore in mm', example: 500 })
  @Column({ type: 'decimal', precision: 8, scale: 3 })
  nominalBoreMm: number;

  @ApiProperty({ description: 'Schedule type - using schedule number or wall thickness', enum: ScheduleType })
  @Column({ type: 'enum', enum: ScheduleType })
  scheduleType: ScheduleType;

  @ApiProperty({ description: 'Schedule number (e.g., Sch20, Sch40)', required: false })
  @Column({ nullable: true })
  scheduleNumber?: string;

  @ApiProperty({ description: 'Wall thickness in mm (if not using schedule)', required: false })
  @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true })
  wallThicknessMm?: number;

  @ApiProperty({ description: 'Individual pipe length', example: 12.192 })
  @Column({ type: 'decimal', precision: 8, scale: 3 })
  individualPipeLength: number;

  @ApiProperty({ description: 'Length unit', enum: LengthUnit })
  @Column({ type: 'enum', enum: LengthUnit })
  lengthUnit: LengthUnit;

  @ApiProperty({ description: 'Quantity type - total length or number of pipes', enum: QuantityType })
  @Column({ type: 'enum', enum: QuantityType })
  quantityType: QuantityType;

  @ApiProperty({ description: 'Quantity value - total meters or number of pipes', example: 8000 })
  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantityValue: number;

  @ApiProperty({ description: 'Working pressure in bar', example: 10 })
  @Column({ type: 'decimal', precision: 8, scale: 2 })
  workingPressureBar: number;

  @ApiProperty({ description: 'Working temperature in celsius', required: false })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  workingTemperatureC?: number;

  // Calculated fields
  @ApiProperty({ description: 'Calculated outside diameter in mm', required: false })
  @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true })
  calculatedOdMm?: number;

  @ApiProperty({ description: 'Calculated wall thickness in mm', required: false })
  @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true })
  calculatedWtMm?: number;

  @ApiProperty({ description: 'Calculated pipe weight per meter in kg', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  pipeWeightPerMeterKg?: number;

  @ApiProperty({ description: 'Calculated total pipe weight in kg', required: false })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalPipeWeightKg?: number;

  @ApiProperty({ description: 'Calculated number of pipes', required: false })
  @Column({ type: 'int', nullable: true })
  calculatedPipeCount?: number;

  @ApiProperty({ description: 'Calculated total length in meters', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  calculatedTotalLengthM?: number;

  @ApiProperty({ description: 'Number of flanges required', required: false })
  @Column({ type: 'int', nullable: true })
  numberOfFlanges?: number;

  @ApiProperty({ description: 'Number of butt welds required', required: false })
  @Column({ type: 'int', nullable: true })
  numberOfButtWelds?: number;

  @ApiProperty({ description: 'Total butt weld length in meters', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  totalButtWeldLengthM?: number;

  @ApiProperty({ description: 'Number of flange welds required', required: false })
  @Column({ type: 'int', nullable: true })
  numberOfFlangeWelds?: number;

  @ApiProperty({ description: 'Total flange weld length in meters', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  totalFlangeWeldLengthM?: number;

  // Relationships
  @ApiProperty({ description: 'Parent RFQ item', type: () => RfqItem })
  @OneToOne(() => RfqItem, (rfqItem) => rfqItem.straightPipeDetails, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rfq_item_id' })
  rfqItem: RfqItem;

  @ApiProperty({ description: 'Steel specification', required: false })
  @ManyToOne(() => SteelSpecification, { nullable: true })
  @JoinColumn({ name: 'steel_specification_id' })
  steelSpecification?: SteelSpecification;

  @ApiProperty({ description: 'Pipe dimension used for calculations', required: false })
  @ManyToOne(() => PipeDimension, { nullable: true })
  @JoinColumn({ name: 'pipe_dimension_id' })
  pipeDimension?: PipeDimension;

  @ApiProperty({ description: 'Flange standard', required: false })
  @ManyToOne(() => FlangeStandard, { nullable: true })
  @JoinColumn({ name: 'flange_standard_id' })
  flangeStandard?: FlangeStandard;

  @ApiProperty({ description: 'Flange pressure class', required: false })
  @ManyToOne(() => FlangePressureClass, { nullable: true })
  @JoinColumn({ name: 'flange_pressure_class_id' })
  flangePressureClass?: FlangePressureClass;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Rfq } from './rfq.entity';
import { StraightPipeRfq } from './straight-pipe-rfq.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum RfqItemType {
  STRAIGHT_PIPE = 'straight_pipe',
  FITTING = 'fitting',
  FLANGE = 'flange',
  CUSTOM = 'custom',
}

@Entity('rfq_items')
export class RfqItem {
  @ApiProperty({ description: 'Primary key', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Item description', example: '500NB Sch20 Straight Pipe for 10 Bar Pipeline' })
  @Column()
  description: string;

  @ApiProperty({ description: 'Type of RFQ item', enum: RfqItemType })
  @Column({ type: 'enum', enum: RfqItemType })
  itemType: RfqItemType;

  @ApiProperty({ description: 'Quantity required', example: 656 })
  @Column({ type: 'int' })
  quantity: number;

  @ApiProperty({ description: 'Unit of measurement', example: 'pieces' })
  @Column({ default: 'pieces' })
  unit: string;

  @ApiProperty({ description: 'Estimated weight per unit in kg', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  weightPerUnitKg?: number;

  @ApiProperty({ description: 'Total estimated weight in kg', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalWeightKg?: number;

  @ApiProperty({ description: 'Unit price', required: false })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  unitPrice?: number;

  @ApiProperty({ description: 'Total price', required: false })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalPrice?: number;

  @ApiProperty({ description: 'Additional notes', required: false })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Parent RFQ', type: () => Rfq })
  @ManyToOne(() => Rfq, (rfq) => rfq.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rfq_id' })
  rfq: Rfq;

  @ApiProperty({ description: 'Straight pipe details (if item type is straight_pipe)', required: false, type: () => StraightPipeRfq })
  @OneToOne(() => StraightPipeRfq, (straightPipe) => straightPipe.rfqItem, { cascade: true, nullable: true })
  straightPipeDetails?: StraightPipeRfq;
}

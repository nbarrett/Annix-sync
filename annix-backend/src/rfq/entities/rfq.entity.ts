import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { RfqItem } from './rfq-item.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum RfqStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  QUOTED = 'quoted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity('rfqs')
export class Rfq {
  @ApiProperty({ description: 'Primary key', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Auto-generated RFQ number', example: 'RFQ-2025-0001' })
  @Column({ unique: true })
  rfqNumber: string;

  @ApiProperty({ description: 'Project name', example: '500NB Pipeline Extension' })
  @Column()
  projectName: string;

  @ApiProperty({ description: 'Project description', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Customer company name', required: false })
  @Column({ nullable: true })
  customerName?: string;

  @ApiProperty({ description: 'Customer email', required: false })
  @Column({ nullable: true })
  customerEmail?: string;

  @ApiProperty({ description: 'Customer phone number', required: false })
  @Column({ nullable: true })
  customerPhone?: string;

  @ApiProperty({ description: 'Required delivery date', required: false })
  @Column({ type: 'date', nullable: true })
  requiredDate?: Date;

  @ApiProperty({ description: 'RFQ status', enum: RfqStatus })
  @Column({ type: 'enum', enum: RfqStatus, default: RfqStatus.DRAFT })
  status: RfqStatus;

  @ApiProperty({ description: 'Additional notes', required: false })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Total estimated weight in kg', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalWeightKg?: number;

  @ApiProperty({ description: 'Total estimated cost', required: false })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalCost?: number;

  @ApiProperty({ description: 'User who created this RFQ', type: () => User })
  @ManyToOne(() => User, (user) => user.rfqs)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @ApiProperty({ description: 'RFQ items', type: () => [RfqItem] })
  @OneToMany(() => RfqItem, (item) => item.rfq, { cascade: true })
  items: RfqItem[];

  @ApiProperty({ description: 'Creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @UpdateDateColumn()
  updatedAt: Date;
}

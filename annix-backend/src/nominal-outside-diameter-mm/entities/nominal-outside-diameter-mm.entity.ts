import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('nominal_outside_diameters')
@Unique(['nominal_diameter_mm', 'outside_diameter_mm']) // ensure that there are no duplicate combinations
export class NominalOutsideDiameterMm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  nominal_diameter_mm: number;

  @Column({ type: 'float' })
  outside_diameter_mm: number;    
}

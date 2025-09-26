// export class FittingBore {}
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Fitting } from 'src/fitting/entities/fitting.entity';
import { NominalOutsideDiameterMm } from 'src/nominal-outside-diameter-mm/entities/nominal-outside-diameter-mm.entity';
import { FittingVariant } from 'src/fitting-variant/entities/fitting-variant.entity';

@Entity('fitting_bores')
export class FittingBore {
  @PrimaryGeneratedColumn({ name: 'fitting_bore_id' })
  id: number;

  @Column({ name: 'bore_position', type: 'text' })
  borePositionName: string;

  @ManyToOne(() => NominalOutsideDiameterMm, (nominal) => nominal.fittingBores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nominal_outside_diameter_id' })
  nominalOutsideDiameter: NominalOutsideDiameterMm;

  @ManyToOne(() => FittingVariant, (variant) => variant.bores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fitting_variant_id' })
  variant: FittingVariant;
}

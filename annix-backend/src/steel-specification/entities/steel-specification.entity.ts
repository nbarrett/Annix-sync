import { Fitting } from 'src/fitting/entities/fitting.entity';
import { PipeDimension } from 'src/pipe-dimension/entities/pipe-dimension.entity';
import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany } from 'typeorm';

@Entity('steel_specifications')
@Unique(['steelSpecName']) 
export class SteelSpecification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'steel_spec_name', type: 'text', unique: true })
    steelSpecName: string;

    @OneToMany(() => Fitting, (fitting) => fitting.steelSpecification, { cascade: true })
    fittings: Fitting[];

    @OneToMany(() => PipeDimension, (dimension) => dimension.steelSpecification, { cascade: true })
    pipeDimensions: PipeDimension[];
}

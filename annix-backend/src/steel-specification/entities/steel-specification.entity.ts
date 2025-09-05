import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('steel_specifications')
@Unique(['steelSpecName']) 
export class SteelSpecification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'steel_spec_name', type: 'text', unique: true })
    steelSpecName: string;
}

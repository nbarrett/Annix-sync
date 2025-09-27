import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany } from 'typeorm';

@Entity('weld_types')
@Unique(['code'])
export class WeldType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  code: string; // e.g. "FWP", "BWF", "TEE", "MIT"

  @Column({ type: 'varchar', length: 255 })
  description: string; // e.g. "Flange Weld Pipes (Over 2.5m)"
}

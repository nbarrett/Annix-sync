import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { UserRole } from '../../user-roles/entities/user-role.entity'
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @ApiProperty({ description: 'Primary key', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Unique username', example: 'john_doe' })
  @Column({ unique: true, nullable: true })
  username: string;

  @ApiProperty({ description: 'User email address', example: 'john@example.com' })
  @Column({ unique: true, nullable: true })
  email: string;

  @ApiProperty({ description: 'Hashed password (never expose in responses)' })
  @Exclude()
  @Column({ nullable: true })
  password: string;

  @ApiProperty({ description: 'Random salt used for password hashing' })
  @Exclude()
  @Column()
  salt: string;

  @ApiProperty({
    description: 'Roles assigned to the user',
    type: () => [UserRole],
  })
  @ManyToMany(() => UserRole, (role) => role.users, { eager: true })
  @JoinTable()
  roles: UserRole[];
}

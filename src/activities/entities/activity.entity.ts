import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';


@Entity('activities')
export class ActivityEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'The unique identifier of the activity',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The name of the activity',
    example: 'Yoga',
  })
  @Column()
  name: string;

  @ManyToMany(() => UserEntity, (user) => user.spiritualPractices.activities)
  users: UserEntity[];
}

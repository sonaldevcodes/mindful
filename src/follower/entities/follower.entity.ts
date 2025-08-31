import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('matches')
export class MatchEntity {
  @ApiProperty({ example: 1, description: 'The unique identifier of the match' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => UserEntity, description: 'The first user in the match' })
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'userAId' })
  userA: UserEntity;

  @ApiProperty({ example: 1, description: 'The ID of the first user in the match' })
  @Column()
  userAId: number;

  @ApiProperty({ type: () => UserEntity, description: 'The second user in the match' })
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'userBId' })
  userB: UserEntity;

  @ApiProperty({ example: 2, description: 'The ID of the second user in the match' })
  @Column()
  userBId: number;

  @ApiProperty({ example: '2024-09-24T12:34:56.789Z', description: 'The date when the match was created' })
  @CreateDateColumn()
  createdAt: Date;
}

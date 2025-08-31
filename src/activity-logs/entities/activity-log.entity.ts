import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('activity_logs')
export class ActivityLogEntity {
  @ApiProperty({ description: 'Unique identifier for the activity log' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Type of the activity' })
  @Column()
  activityType: string;

  @ApiProperty({ description: 'Name of the activity' })
  @Column()
  activityName: string;

  @ApiProperty({ description: 'Start time of the activity', example: '2024-10-08T12:00:00Z' })
  @Column()
  startTime: Date;

  @ApiProperty({ description: 'End time of the activity', example: '2024-10-08T14:00:00Z' })
  @Column({nullable: true})
  endTime: Date;

  @ApiProperty({ description: 'Duration of the activity in minutes', example: 120 })
  @Column({nullable: true})
  duration: number;

  @ApiProperty({ description: 'ratings 1', type: 'json' })
  @Column('json', { nullable: true })
  ratings_1: { userId: number; rating: number, timestamp: Date }[];

  @ApiProperty({ description: 'ratings 2', type: 'json' })
  @Column('json', { nullable: true })
  ratings_2: { userId: number; rating: number, timestamp: Date; }[];

  // @ApiProperty({ description: 'First rating for the activity (optional)', nullable: true, type: 'number', format: 'float' })
  // @Column({ type: 'float', nullable: true })
  // rating_1: number;

  // @ApiProperty({ description: 'Second rating for the activity (optional)', nullable: true, type: 'number', format: 'float' })
  // @Column({ type: 'float', nullable: true })
  // rating_2: number;

  @ApiProperty({ description: 'Feedback for the activity (optional)', nullable: true, type: 'string' })
  @Column('text', { nullable: true })
  feedback: string;

  @ApiProperty({ description: 'Details of participants (optional)', nullable: true, type: 'json' })
  @Column('json', { nullable: true })
  participantDetails: any;

  @ApiProperty({ description: 'User who started the activity', type: () => UserEntity })
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'startedByUserId' })
  startedByUser: UserEntity;

  @ApiProperty({ description: 'ID of the user who started the activity' })
  @Column()
  startedByUserId: number;

  @ApiProperty({ description: 'List of participants (optional)', type: () => [UserEntity], nullable: true })
  @ManyToMany(() => UserEntity, { nullable: true })
  @JoinTable() // Use @JoinTable if it's a many-to-many relation
  participants: UserEntity[];

  @ApiProperty({ description: 'Timestamp when the activity log was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp when the activity log was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}

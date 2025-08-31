import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Question } from '../questions/question.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';

@Entity('Questionnaires')
export class Questionnaire {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier of the questionnaire.' })
  id: number;

  @Column()
  @ApiProperty({ description: 'The title of the questionnaire.' })
  title: string;

  @ManyToMany(() => Question, question => question.questionnaires)
  @ApiProperty({
    description: 'The questions associated with the questionnaire.',
    type: [Question],
    required: false
  })
  questions: Question[];

  @ManyToMany(() => UserEntity, user => user.spiritualPractices.questionnaire)
  @JoinTable({
    name: 'user_questionnaires', // This is the join table
    joinColumn: { name: 'questionnaire_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  @ApiProperty({
    description: 'The users linked to this questionnaire.',
    type: [UserEntity],
    required: false,
  })
  users: UserEntity[];
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Questionnaire } from '../entities/questionnaire.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { QuestionType } from '../questionstype.enum';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier of the question.' })
  id: number;

  @Column()
  @ApiProperty({ description: 'The text of the question.' })
  text: string;

  @Column({ type: 'enum', enum: QuestionType, nullable: true })
  @IsEnum(QuestionType)
  @ApiProperty({ description: 'The type of the question', enum: QuestionType, example: QuestionType.MULTIPLE_CHOICE, required: false })
  type?: QuestionType;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Comma-separated options for multiple-choice questions', example: 'Red,Green,Blue', required: false })
  options?: string;

  @ManyToMany(() => Questionnaire, questionnaire => questionnaire.questions)
  @JoinTable()
  questionnaires: Questionnaire[];
}

import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuestionType } from '../../questionstype.enum';

export class CreateQuestionDto {
  @IsString()
  @ApiProperty({ description: 'The text of the question', example: 'What is your favorite color?' })
  text: string;

  @IsEnum(QuestionType)
  @ApiProperty({ description: 'The type of the question', enum: QuestionType, example: QuestionType.MULTIPLE_CHOICE })
  type: QuestionType;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Comma-separated options for multiple-choice questions', example: 'Red,Green,Blue', required: false })
  options?: string;
}

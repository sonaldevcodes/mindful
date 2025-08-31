import { IsString, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionnaireDto {
  
  @ApiProperty({ description: 'The title of the questionnaire' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ 
    description: 'Array of question IDs related to the questionnaire', 
    type: [Number],
    example: [1, 2, 3] 
  })
  @IsArray()
  @Type(() => Number)
  @IsOptional()
  questionIds?: number[];
}

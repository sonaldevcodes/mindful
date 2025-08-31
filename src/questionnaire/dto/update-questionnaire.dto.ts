import { IsString, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateQuestionnaireDto {

  @ApiPropertyOptional({ description: 'The updated title of the questionnaire' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ 
    description: 'Array of updated question IDs related to the questionnaire', 
    type: [Number],
    example: [1, 2, 3] 
  })
  @IsArray()
  @Type(() => Number)
  @IsOptional()
  questionIds?: number[];
}

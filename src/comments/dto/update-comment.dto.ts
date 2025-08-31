import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({ required: false, example: 'This is a comment!' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ required: false, description: 'ID of the post the comment is associated with' })
  @IsNumber()
  @IsOptional()
  postId?: number;

  @ApiProperty({ required: false, description: 'ID of the user updating the comment' })
  @IsNumber()
  @IsOptional()
  userId?: number;

  @ApiProperty({ example: 1, required: false, description: 'ID of the parent comment for nested comments' })
  @IsOptional()
  @IsNumber()
  parentCommentId?: number;
  
}

import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'This is a comment!' })
  @IsString()
  content: string;

  @ApiProperty({ example: 1, description: 'ID of the post the comment is associated with' })
  @IsNumber()
  postId: number;

  @ApiProperty({ example: 2, description: 'ID of the user creating the comment' })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 1, required: false, description: 'ID of the parent comment for nested comments' })
  @IsOptional()
  @IsNumber()
  parentCommentId?: number;
}

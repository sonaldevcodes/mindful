import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'This is a new post!' })
  @IsString()
  content: string;

  @ApiProperty({ example: [1, 2], description: 'Array of media IDs associated with the post' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  mediaIds?: number[];

  @ApiProperty({ example: 1, description: 'user id' })
  @IsNumber()
  userId: number;
}

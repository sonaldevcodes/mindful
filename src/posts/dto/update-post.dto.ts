import { IsOptional, IsString, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiProperty({ example: 'Updated post content', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ example: [1, 2], description: 'Array of media IDs associated with the post' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  mediaIds?: number[];

  @ApiProperty({ example: 1, required: false, description: 'user id' })
  @IsOptional()
  @IsNumber()
  userId?: number;
}

// src/media/dto/create-media.dto.ts
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMediaDto {
  @ApiProperty({ example: 'profile-image.jpg', description: 'URL of the uploaded media' })
  @IsOptional()
  @IsString()
  url: string;

  @ApiProperty({ example: 'image', enum: ['image', 'video', 'document'], description: 'Type of the media' })
  @IsNotEmpty()
  @IsEnum(['image', 'video','document'])
  type: 'image' | 'video' | 'document';

  @ApiProperty({ example: 1, description: 'ID of the post if the media is associated with a post', required: false })
  @IsOptional()
  @IsNumber()
  postId?: number;

  @ApiProperty({ example: 1, description: 'ID of the user if the media is associated with a user profile', required: false })
  @IsOptional()
  @IsNumber()
  userId?: number;
}

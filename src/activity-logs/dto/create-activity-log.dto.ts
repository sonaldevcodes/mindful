import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, IsDateString, IsInt, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class UserRating {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @IsOptional()
  @IsDateString()
  timestamp: Date;
}

export class CreateActivityLogDto {
  @ApiProperty({ description: 'Type of the activity' })
  @IsNotEmpty()
  @IsString()
  activityType: string;

  @ApiProperty({ description: 'Name of the activity' })
  @IsString()
  @IsNotEmpty()
  activityName: string;

  @ApiProperty({ description: 'Start time of the activity', example: '2024-09-12T10:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  startTime: Date;

  @ApiProperty({ description: 'End time of the activity', example: '2024-09-12T11:00:00Z' })
  @IsOptional()
  @IsDateString()
  endTime: Date;

  @ApiProperty({ description: 'Duration of the activity in minutes', example: 60 })
  @IsOptional()
  @IsNumber()
  duration: number;

  @ApiProperty({ description: 'Rating 1', required: false, example: [{userId: 2, rating: 2},{userId: 2, rating: 2} ] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserRating)
  ratings_1: UserRating[];

  @ApiProperty({ description: 'Rating 2', required: false, example: [{userId: 2, rating: 2},{userId: 2, rating: 2} ] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserRating)
  ratings_2: UserRating[];

  // @ApiProperty({ description: 'Rating 1 of the activity', example: 4, required: false })
  // @IsOptional()
  // @IsNumber()
  // rating_1?: number;

  // @ApiProperty({ description: 'Rating 2 of the activity', example: 4, required: false })
  // @IsOptional()
  // @IsNumber()
  // rating_2?: number;

  @ApiProperty({ description: 'Feedback for the activity', required: false })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiProperty({ description: 'Started user id', required: false }) 
  @IsInt()
  @IsNotEmpty()
  startedByUserId: number;

  @ApiProperty({ description: 'Array of participant IDs', example: [1, 2] })
  @IsArray()
  @IsNotEmpty()
  participants?: number[];
}

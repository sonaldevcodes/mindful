import { IsEnum, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LikeStatus } from '../likes.status.enum';

export class CreateLikeDto {
  @ApiProperty({ example: 1, description: 'ID of the user' })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 1, description: 'ID of the target (post or comment)' })
  @IsNumber()
  targetId: number;

  @ApiProperty({ example: 'POST', description: 'Type of the target, either POST or COMMENT' })
  @IsString()
  type: string;

  @ApiProperty({ example: LikeStatus.LIKE, description: 'Status of the like' })
  @IsEnum(LikeStatus)
  status: LikeStatus;
}

import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LikeStatus } from '../likes.status.enum';

export class UpdateLikeDto {
    @ApiProperty({ example: LikeStatus.LIKE, description: 'Status of the like' })
    @IsEnum(LikeStatus)
    status: LikeStatus;
}

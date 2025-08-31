import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetActivityLogDto {
  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({
    description: 'Start date for the activity logs, in ISO 8601 format',
    example: '2024-10-01T00:00:00Z',
  })
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({
    description: 'End date for the activity logs, in ISO 8601 format',
    example: '2024-10-07T23:59:59Z',
  })
  endDate: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'targetUser user id',
    example: 1,
  })
  targetUserId: string;
}

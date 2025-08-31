import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateActivityDto {
  @ApiProperty({
    description: 'The name of the activity',
    example: 'Yoga',
  })
  @IsString()
  name: string;
}

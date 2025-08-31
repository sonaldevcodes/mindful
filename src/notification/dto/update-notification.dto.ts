import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateNotificationDto } from './create-notification.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationDto {
    @ApiPropertyOptional({
        example: false,
        description: 'Indicates whether the notification has been read.',
      })
      @IsBoolean()
      @IsOptional()
      isRead?: boolean;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { NotificationTypeEnum } from '../enum/notification.enum';
import { Column } from 'typeorm';
import { NotificationSubTypeEnum } from '../enum/notification.sub-type';


export class CreateNotificationDto {
  @ApiProperty({ example: 1, description: 'ID of the user sending the notification' })
  @IsNumber()
  @IsNotEmpty()
  userAId: number;

  @ApiProperty({ example: 2, description: 'ID of the user receiving the notification' })
  @IsNumber()
  @IsNotEmpty()
  userBId: number;

  @ApiProperty({
    enum: NotificationTypeEnum,
    example: NotificationTypeEnum.MATCHES,
    description: 'Type of the notification. Enum values: Auth, Users, Questions, Activities, Media, Matches, Favorites, Activity Logs',
  })
  @IsEnum(NotificationTypeEnum)
  @IsNotEmpty()
  notificationType: NotificationTypeEnum;

  @ApiProperty({
    enum: NotificationTypeEnum,
    example: NotificationTypeEnum.MATCHES,
    description: 'Type of the notification. Enum values: Auth, Users, Questions, Activities, Media, Matches, Favorites, Activity Logs',
  })
  @IsEnum(NotificationSubTypeEnum)
  @IsOptional()
  subType?: NotificationSubTypeEnum;

  @ApiProperty({
    example: 'You have a new match!',
    description: 'Title of the notification',
  })
  @IsString()
  @Length(5, 100)
  title: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Indicates whether the notification has been read.',
  })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @ApiProperty({
    example: 'UserA and UserB are now matched!',
    description: 'Body of the notification',
  })
  @IsString()
  @Length(10, 500)
  body: string;
}

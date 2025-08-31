import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationTypeEnum } from '../enum/notification.enum';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { NotificationSubTypeEnum } from '../enum/notification.sub-type';

@Entity('notifications')
export class NotificationEntity {
  @ApiProperty({ example: 1, description: 'The unique ID of the notification' })
  @PrimaryGeneratedColumn()
  id: number;

  // @ApiProperty({
  //   example: 1,
  //   description: 'The user ID who sent the notification',
  // })
  // @Column()
  @ManyToOne(() => UserEntity, (user) => user.sentNotifications, { eager: false })
  userAId: UserEntity;

  // @ApiProperty({
  //   example: 2,
  //   description: 'The user ID who received the notification',
  // })
  @ManyToOne(() => UserEntity, (user) => user.receivedNotifications, { eager: false })
  // @Column()
  userBId: UserEntity;
  // userBId: number;

  @ApiProperty({
    enum: NotificationTypeEnum,
    example: NotificationTypeEnum.MATCHES,
    description: 'The type of notification, such as Matches, Favorites, etc.',
  })
  @Column()
  notificationType: NotificationTypeEnum;

  @ApiProperty({
    enum: NotificationSubTypeEnum,
    example: NotificationSubTypeEnum.TEXT_ACTIVITY,
    description: 'The sub type of notification, such as textActivity etc.',
  })
  @Column({
    type: 'enum', // Specify that this is an enum type
    enum: NotificationSubTypeEnum, // Associate with your enum
    nullable: true, // Allows null values, if desired
  })
  subType?: NotificationSubTypeEnum; // Make it optional if needed

  @ApiProperty({
    example: 'You have a new match!',
    description: 'Title of the notification',
  })
  @Column()
  title: string;

  @ApiProperty({
    example: 'UserA and UserB are now matched!',
    description: 'Body of the notification',
  })
  @Column()
  body: string;

  @ApiProperty({
    example: false,
    description: 'Indicates whether the notification has been read. Default is false.',
  })
  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @ApiProperty({
    example: '2024-10-07T10:23:54.123Z',
    description: 'Date and time when the notification was created',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2024-10-07T12:00:00.000Z',
    description: 'Date and time when the notification was last updated',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationEntity } from './entities/notification.entity';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { ActivityEntity } from '../activities/entities/activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity, UserEntity, ActivityEntity]), // Register the NotificationEntity
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}

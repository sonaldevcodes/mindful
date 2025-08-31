import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogEntity } from './entities/activity-log.entity';
import { ActivityLogService } from './activity-logs.service';
import { ActivityLogController } from './activity-logs.controller';
import { UserModule } from '../users/users.module';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import { FirebaseAdminService } from '../common/firebase/firebase-admin';
import { NotificationEntity } from '../notification/entities/notification.entity';
import { ActivityEntity } from '../activities/entities/activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLogEntity, UserEntity, NotificationEntity, ActivityEntity]),
    UserModule
  ],
  providers: [ActivityLogService, FirebaseAdminService, NotificationService],
  controllers: [ActivityLogController],
})
export class ActivityLogModule { }

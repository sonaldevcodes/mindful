import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesService } from './follower.service';
import { MatchesController } from './follower.controller';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { MatchEntity } from './entities/follower.entity';
import { FirebaseAdminService } from '../common/firebase/firebase-admin';
import { NotificationService } from '../notification/notification.service';
import { NotificationEntity } from '../notification/entities/notification.entity';
import { ActivityEntity } from '../activities/entities/activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatchEntity, UserEntity, NotificationEntity, ActivityEntity]),],
  providers: [MatchesService, FirebaseAdminService, NotificationService],
  controllers: [MatchesController],
})
export class FollowerModule {}

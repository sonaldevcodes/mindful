import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { FavoriteEntity } from './entities/favourite.entity';
import { FavoritesController } from './favourites.controller';
import { FavoritesService } from './favourites.service';
import { FirebaseAdminService } from '../common/firebase/firebase-admin';
import { NotificationService } from '../notification/notification.service';
import { NotificationEntity } from '../notification/entities/notification.entity';
import { ActivityEntity } from '../activities/entities/activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FavoriteEntity, UserEntity, NotificationEntity, ActivityEntity])],
  controllers: [FavoritesController],
  providers: [FavoritesService, FirebaseAdminService, NotificationService],
  exports: [FavoritesService],
})
export class FavoritesModule {}

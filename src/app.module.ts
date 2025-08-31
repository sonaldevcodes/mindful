import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './users/users.module';
import { ActivitiesModule } from './activities/activities.module';
import { AuthModule } from './auth/auth.module';
import { MediaModule } from './media/media.module';
import { QuestionnaireModule } from './questionnaire/questionnaire.module';
import { FirebaseModule } from './common/firebase/firebase.module';
import { QuestionModule } from './questionnaire/questions/question.module';
import { FollowerModule } from './follower/follower.module';
import { FavoritesModule } from './favourites/favourites.module';
import { ActivityLogModule } from './activity-logs/activity-logs.module';
import { NotificationModule } from './notification/notification.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FirebaseAdminService } from './common/firebase/firebase-admin';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make the config globally accessible
      envFilePath: '.env'
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', "uploads"), // Path to your images folder
      serveRoot: '/uploads', // URL prefix to access images
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false
    }),
    AuthModule,
    UserModule,
    ActivitiesModule,
    MediaModule,
    QuestionnaireModule,
    QuestionModule,
    FollowerModule,
    FavoritesModule,
    ActivityLogModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [FirebaseAdminService],
  exports: [FirebaseAdminService],
})
export class AppModule {}

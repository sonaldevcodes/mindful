import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './infrastructure/persistence/relational/entities/user.entity';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { FirebaseAdminService } from '../common/firebase/firebase-admin';
import { Questionnaire } from '../questionnaire/entities/questionnaire.entity';
import { QuestionnaireModule } from '../questionnaire/questionnaire.module';
import { FavoriteEntity } from '../favourites/entities/favourite.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MatchEntity } from '../follower/entities/follower.entity';


@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ActivityEntity, FavoriteEntity, MatchEntity]),
  JwtModule.registerAsync({
    imports: [ConfigModule], // Import ConfigModule
    inject: [ConfigService], // Inject ConfigService
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('AUTH_JWT_SECRET'), // Access the JWT secret from .env
      signOptions: { expiresIn: '365d' }, // Use desired expiration time
    }),
  }),
    QuestionnaireModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserEntity, FirebaseAdminService],
  exports: [UserService, UserEntity],
})
export class UserModule { }

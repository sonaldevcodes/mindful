import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseAdminService } from '../common/firebase/firebase-admin';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { UserService } from '../users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { UserModule } from '../users/users.module';
import { Questionnaire } from '../questionnaire/entities/questionnaire.entity';
import { Question } from '../questionnaire/questions/question.entity';
import { FavoriteEntity } from '../favourites/entities/favourite.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MatchEntity } from '../follower/entities/follower.entity';
import { TelnyxLogModule } from '../telnyx-log/telnyx-log.module';
import { TelnyxLogService } from '../telnyx-log/telnyx-log.service';
import { TelnyxLogEntity } from '../telnyx-log/entities/telnyx-log.entity';

@Module({
  imports: [JwtModule.registerAsync({
    global: true,
    imports: [ConfigModule, TelnyxLogModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('AUTH_JWT_SECRET'),
      signOptions: { expiresIn: '365d' },
    }),
  }),
  TypeOrmModule.forFeature([UserEntity, Questionnaire, Question, FavoriteEntity, MatchEntity, TelnyxLogEntity]),
    UserModule
  ],
  controllers: [AuthController],
  providers: [AuthService,TelnyxLogService, FirebaseAdminService, UserService, JwtAuthGuard],
  exports: [UserService, AuthService],
})
export class AuthModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeEntity } from './entities/like.entity';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { PostEntity } from '../posts/entities/post.entity';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';


@Module({
  imports: [TypeOrmModule.forFeature([LikeEntity, UserEntity, PostEntity])],
  providers: [LikesService],
  controllers: [LikesController],
})
export class LikeModule {}

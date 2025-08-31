import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './entities/comment.entity';
import { NestedCommentEntity } from './entities/nested-comment.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity, NestedCommentEntity])],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}

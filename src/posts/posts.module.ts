import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostEntity } from './entities/post.entity';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity]),
    MediaModule, // Import MediaModule
  ],
  providers: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}

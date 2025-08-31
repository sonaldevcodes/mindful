import { Controller, Post, Body, Param, Put, Get, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentEntity } from './entities/comment.entity';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async createComment(@Body() createCommentDto: CreateCommentDto): Promise<CommentEntity> {
    return this.commentsService.createComment(createCommentDto);
  }

  @Put(':id')
  async updateComment(
    @Param('id') id: number,
    @Body() updateCommentDto: UpdateCommentDto
  ): Promise<CommentEntity> {
    return this.commentsService.updateComment(id, updateCommentDto);
  }

  @Get('post/:postId')
  async getCommentsByPostId(
    @Param('postId') postId: number,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0
  ): Promise<{ data: CommentEntity[], total: number }> {
    return this.commentsService.getCommentsByPostId(postId, limit, offset);
  }
}

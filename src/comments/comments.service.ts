import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CommentEntity } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  async createComment(createCommentDto: CreateCommentDto): Promise<CommentEntity> {
    const comment = this.commentRepository.create(createCommentDto);
    return this.commentRepository.save(comment);
  }

  async updateComment(id: number, updateCommentDto: UpdateCommentDto): Promise<CommentEntity> {
    const { content } = updateCommentDto;
  
    // Fetch the comment that needs to be updated
    const comment = await this.commentRepository.findOneBy({ id });
  
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
  
    comment.content = content ?? comment.content;
  
    return this.commentRepository.save(comment);
  }
  

  async getCommentsByPostId(postId: number, limit: number = 10, offset: number = 0): Promise<{ data: CommentEntity[], total: number }> {
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { postId },
      skip: offset,
      take: limit,
    });

    return { data: comments, total };
  }
}

import { Controller, Post, Body, Param, Delete, Get, Query, Patch } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { LikeEntity } from './entities/like.entity';
import { LikesService } from './likes.service';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  async createLike(@Body() createLikeDto: CreateLikeDto): Promise<LikeEntity> {
    return this.likesService.createLike(createLikeDto);
  }

  @Delete(':id')
  async deleteLike(@Param('id') id: number): Promise<void> {
    return this.likesService.deleteLike(id);
  }

  @Patch(':id')
  async updateLike(
    @Param('id') id: number,
    @Body() updateLikeDto: UpdateLikeDto,
  ): Promise<LikeEntity> {
    return this.likesService.updateLike(id, updateLikeDto);
  }

  @Get('post/:postId')
  async getLikesByPostId(
    @Param('postId') postId: number,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ): Promise<{ data: LikeEntity[], total: number }> {
    return this.likesService.getLikesByPostId(postId, limit, offset);
  }
}

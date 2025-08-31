import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { LikeEntity } from './entities/like.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(LikeEntity)
    private readonly likeRepository: Repository<LikeEntity>,
  ) {}

  async createLike(createLikeDto: CreateLikeDto): Promise<LikeEntity> {
    const like = this.likeRepository.create(createLikeDto);
    return this.likeRepository.save(like);
  }

  async deleteLike(id: number): Promise<void> {
    const result = await this.likeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Like with ID ${id} not found`);
    }
  }

  async updateLike(id: number, updateLikeDto: UpdateLikeDto): Promise<LikeEntity> {
    const like = await this.likeRepository.findOneBy({ id });
  
    if (!like) {
      throw new NotFoundException(`Like with ID ${id} not found`);
    }
  
    if (updateLikeDto.status) {
      like.status = updateLikeDto.status;
    }
  
    return this.likeRepository.save(like);
  }
  

  async getLikesByPostId(targetId: number, limit: number, offset: number): Promise<{ data: LikeEntity[], total: number }> {
    const [data, total] = await this.likeRepository.findAndCount({
      where: { targetId },
      take: limit,
      skip: offset,
    });
    return { data, total };
  }
}

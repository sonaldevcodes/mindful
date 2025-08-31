import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaEntity } from '../entities/media.entity';
import { CreateMediaDto } from './create-media.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaEntity)
    private readonly mediaRepository: Repository<MediaEntity>,
  ) {}

  async createMedia(createMediaDto: CreateMediaDto): Promise<MediaEntity> {
    const media = this.mediaRepository.create(createMediaDto);
    return this.mediaRepository.save(media);
  }

  async getMediaById(id: number): Promise<MediaEntity> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    return media;
  }

  async getMediaByPostId(postId: number): Promise<MediaEntity[]> {
    return this.mediaRepository.find({ where: { postId } });
  }

  async getMediaByUserId(userId: number): Promise<MediaEntity[]> {
    return this.mediaRepository.find({ where: { userId } });
  }
}

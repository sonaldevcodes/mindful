import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { MediaService } from '../media/media.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    private readonly mediaService: MediaService, // Inject MediaService
  ) {}

  async createPost(createPostDto: CreatePostDto): Promise<PostEntity> {
    const { mediaIds, ...postData } = createPostDto;

    // Fetch media entities if mediaIds are provided
    const media = mediaIds ? await Promise.all(
      mediaIds.map(id => this.mediaService.getMediaById(id))
    ) : [];

    const post = this.postRepository.create({
      ...postData,
      media, // Assign MediaEntity[] to media property
    });

    return this.postRepository.save(post);
  }

  async updatePost(id: number, updatePostDto: UpdatePostDto): Promise<PostEntity> {
    const { content } = updatePostDto;
    // Fetch the post that needs to be updated
    const post = await this.postRepository.findOneBy({ id });

    if (!post) {
        throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Update only the content
    post.content = content ?? post.content;

    return this.postRepository.save(post);
}



  async getPostById(id: number): Promise<PostEntity> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['media'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async getPosts(limit: number = 10, offset: number = 0): Promise<{ data: PostEntity[], total: number }> {
    const [posts, total] = await this.postRepository.findAndCount({
      skip: offset,
      take: limit,
      relations: ['media'],
    });

    return { data: posts, total };
  }
}

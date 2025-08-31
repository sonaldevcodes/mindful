import { Controller, Post, Body, UploadedFile, UseInterceptors, Get, Param, Query, Req, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { ApiConsumes, ApiBody, ApiTags, ApiResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Media')
@Controller('api/media')
@ApiBearerAuth('access-token')
export class MediaController {
  constructor(private readonly mediaService: MediaService) { }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard) // Apply guards
  @Roles('admin', 'user')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a media file (image,video,document)' })
  @ApiResponse({
    status: 201,
    description: 'The media has been successfully uploaded.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        url: { type: 'string', example: '/uploads/sample.jpg' },
        type: { type: 'string', example: 'image' },
        userId: { type: 'number', example: 1 },
        createdAt: { type: 'string', example: '2024-09-23T12:34:56.789Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Invalid file or missing data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access. JWT token is missing or invalid.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          enum: ['image', 'video', 'document'],
        },
        // postId: {
        //   type: 'number',
        //   description: 'Post Id of the user if applicable',
        // },
      },
    },
  })
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body() createMediaDto: CreateMediaDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    // const userId = createMediaDto?.userId || 1; // Assuming user ID is extracted from the request
    const url = `/uploads/${file?.filename}`;
    if (userId) {
      return this.mediaService.createMedia({ ...createMediaDto, url, userId });
    } else {
      return this.mediaService.createMedia({ ...createMediaDto, url });
    }
  }

  @Get('post/:postId')
  @UseGuards(JwtAuthGuard, RolesGuard) // Apply guards
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Get media by post ID' })
  @ApiResponse({
    status: 200,
    description: 'Media files for the specified post.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          url: { type: 'string', example: '/uploads/post1_image.jpg' },
          type: { type: 'string', example: 'image' },
          postId: { type: 'number', example: 1 },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No media found for the specified post ID.',
  })
  async getMediaByPost(@Param('postId') postId: number) {
    return this.mediaService.getMediaByPostId(postId);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard, RolesGuard) // Apply guards
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Get media by the current user' })
  @ApiResponse({
    status: 200,
    description: 'Media files uploaded by the current user.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          url: { type: 'string', example: '/uploads/user1_image.jpg' },
          type: { type: 'string', example: 'image' },
          userId: { type: 'number', example: 1 },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No media found for the current user.',
  })
  async getMediaByUser(@Request() req: any) {
    const userId = req.user.id;
    return this.mediaService.getMediaByUserId(userId);
  }

  @Get('user/:id/top-image')
  @ApiOperation({ summary: 'Get the top (first) image uploaded by a user' })
  @ApiResponse({
    status: 200,
    description: 'The top image uploaded by the user.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        url: { type: 'string', example: '/uploads/user1_image.jpg' },
        type: { type: 'string', example: 'image' },
        userId: { type: 'number', example: 1 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No image found for the specified user.',
  })
  async getTopImageByUser(@Param('id') id: number) {
    return this.mediaService.getTopImageByUserId(id);
  }

}

import { Controller, Post, Body, Get, Param, Delete, UseGuards, Request, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags, ApiOkResponse, ApiExtraModels, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { NotificationEntity } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationTypeEnum } from './enum/notification.enum';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { SearchPaginationDto } from '../common/dtos/search-pagination.dto';
import { SearchPaginationNotificationDto } from '../common/dtos/search-pagination.notification.dto';

@ApiTags('Notifications')
@ApiExtraModels(CreateNotificationDto) 
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // @ApiOperation({ summary: 'Create a new notification' })
  // @ApiBody({
  //   type: CreateNotificationDto,
  //   description: 'Payload to create a new notification',
  //   examples: {
  //     example1: {
  //       summary: 'Example notification payload',
  //       value: {
  //         userAId: 1,
  //         userBId: 2,
  //         notificationType: NotificationTypeEnum.MATCHES,
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({ status: 201, description: 'Notification created', type: NotificationEntity })
  // @Post()
  // async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
  //   return this.notificationService.createNotification(createNotificationDto);
  // }

  @ApiOperation({ summary: 'Get all notifications for a user' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of records to retrieve' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for filtering results' })
  @ApiOkResponse({
    description: 'List of notifications for the user',
    type: NotificationEntity,
    // schema: {
    //   type: 'array',
    //   items: {
    //     type: 'object',
    //     properties: {
    //       id: { type: 'number', example: 1 },
    //       userAId: { type: 'number', example: 1 },
    //       userBId: { type: 'number', example: 2 },
    //       notificationType: { 
    //         type: 'string', 
    //         example: NotificationTypeEnum.MATCHES 
    //       },
    //       createdAt: { type: 'string', example: '2024-10-07T10:23:54.123Z' },
    //     },
    //   },
    // },
  })
  @Get()
  async getNotifications(@Query() searchDto: SearchPaginationNotificationDto, @Request() req: any) {
    const userId = req.user.id;
    return this.notificationService.getNotifications(userId, searchDto);
  }

   // New API for updating notification
   @ApiOperation({ summary: 'Update notification' })
   @ApiOkResponse({
     description: 'Notification updated successfully',
     type: NotificationEntity,
   })
   @Patch(':notificationId')
   async updateNotification(
     @Param('notificationId') notificationId: number,
     @Request() req: any
   ) {
    const userId = req.user.id;
     return this.notificationService.updateNotification(userId, notificationId);
   }

  @ApiOperation({ summary: 'Delete a notification' })
  @ApiOkResponse({
    description: 'Notification deleted successfully',
    schema: {
      example: {
        message: 'Notification deleted successfully',
      },
    },
  })
  @Delete(':notificationId')
  async deleteNotification(@Param('notificationId') notificationId: number) {
    return this.notificationService.deleteNotification(notificationId);
  }
}

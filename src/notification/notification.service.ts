import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationEntity } from './entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { SearchPaginationNotificationDto } from '../common/dtos/search-pagination.notification.dto';
import { ActivityEntity } from '../activities/entities/activity.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

  ) { }

  async createNotification(
    createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationEntity> {
    // const notification = this.notificationRepository.create(createNotificationDto);
    // return await this.notificationRepository.save(notification);
    const userA = await this.userRepository.findOne({
      where: { id: createNotificationDto.userAId },
    });
    const userB = await this.userRepository.findOne({
      where: { id: createNotificationDto.userBId },
    });

    if (!userA || !userB) {
      throw new Error('One or both users not found');
    }
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      userAId: userA, // Assign the full UserEntity object
      userBId: userB, // Assign the full UserEntity object
    });
    return await this.notificationRepository.save(notification);
  }

  async getNotifications(
    userId: number,
    searchDto: SearchPaginationNotificationDto
  ): Promise<NotificationEntity[]> {

    // Start building the query
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification')
      .leftJoinAndSelect('notification.userAId', 'userA')
      .leftJoinAndSelect('notification.userBId', 'userB')
      .where('userB.id = :userId', { userId }) // Referencing the userB relation properly
      .orderBy('notification.createdAt', 'DESC');

    // Add search condition if search term is provided
    if (searchDto?.search) {
      queryBuilder.andWhere(
        '(userA.fullName ILIKE :search OR userB.fullName ILIKE :search OR notification.body ILIKE :search)',
        { search: `%${searchDto?.search}%` }
      );
    }


    // Apply pagination
    queryBuilder.skip(searchDto?.offset).take(searchDto?.limit);

    // Execute query and get results with total count
    const [notifications, totalCount] = await queryBuilder.getManyAndCount();

    // Sanitize the notifications to remove specific keys
    const sanitizedNotifications = await Promise.all(notifications.map(async notification => {

      if (notification?.userAId) {
        notification.userAId.firebaseToken = "";
        notification.userAId.fcmToken = "";
        if (notification?.userAId?.spiritualPractices && Array.isArray(notification?.userAId?.spiritualPractices?.activities)) {
          const query = `SELECT * FROM activities WHERE id IN (${notification?.userAId?.spiritualPractices?.activities.join(',')})`;
          // Execute the raw SQL query using TypeORM's query method and await the result
          const activities = await this.activityRepository.query(query);
          notification.userAId.spiritualPractices.activities = activities || []
        }
      }
      if (notification?.userBId) {
        notification.userBId.firebaseToken = "";
        notification.userBId.fcmToken = "";
        if (notification?.userBId?.spiritualPractices && Array.isArray(notification?.userBId?.spiritualPractices?.activities)) {
          const query = `SELECT * FROM activities WHERE id IN (${notification?.userBId?.spiritualPractices?.activities.join(',')})`;
          // Execute the raw SQL query using TypeORM's query method and await the result
          const activities = await this.activityRepository.query(query);
          notification.userBId.spiritualPractices.activities = activities || []
          
        }
      }
      return notification;
    }));

    return sanitizedNotifications;

  }

  async updateNotification(userId: number, notificationId: number): Promise<NotificationEntity> {
    // Find the notification where the ID matches and either userAId or userBId matches the userId
    const notification = await this.notificationRepository.findOne({
      where: [
        { id: notificationId, userAId: { id: userId } },  // Check if the user is the sender
        { id: notificationId, userBId: { id: userId } },  // Check if the user is the receiver
      ],
      relations: ['userAId', 'userBId'], // Include relations to get the user entities
    });

    // If no notification is found, throw an error
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${notificationId} not found or unauthorized`);
    }

    // If the notification is found, mark it as read
    notification.isRead = true;

    // Save the updated notification
    return this.notificationRepository.save(notification);
  }

  async deleteNotification(
    notificationId: number,
  ): Promise<{ message: string }> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    await this.notificationRepository.remove(notification);
    return { message: 'Notification deleted successfully' };
  }
}

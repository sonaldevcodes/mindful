import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityEntity } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
  ) {}

  async createActivity(createActivityDto: CreateActivityDto): Promise<ActivityEntity> {
    const activity = this.activityRepository.create(createActivityDto);
    return this.activityRepository.save(activity);
  }

  async getActivities(): Promise<ActivityEntity[]> {
    const activities = await this.activityRepository.find();
    if (!activities) {
      throw new NotFoundException(`No data found!`);
    }
    return activities;
  }
  
  async updateActivity(id: number, updateActivityDto: CreateActivityDto): Promise<ActivityEntity> {
    const activity = await this.activityRepository.preload({
      id,
      ...updateActivityDto,
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    return this.activityRepository.save(activity);
  }

  async deleteActivity(id: number): Promise<void> {
    const result = await this.activityRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
  }
}


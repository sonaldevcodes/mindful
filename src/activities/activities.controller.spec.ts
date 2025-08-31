import { Test, TestingModule } from '@nestjs/testing';
import { ActivityController } from './activities.controller';
import { ActivityService } from './activities.service';

describe('ActivitiesController', () => {
  let controller: ActivityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [ActivityService],
    }).compile();

    controller = module.get<ActivityController>(ActivityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

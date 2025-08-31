import { Test, TestingModule } from '@nestjs/testing';
import { ActivityLogService } from './activity-logs.service';

describe('ActivityLogsService', () => {
  let service: ActivityLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityLogService],
    }).compile();

    service = module.get<ActivityLogService>(ActivityLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

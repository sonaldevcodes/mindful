import { Test, TestingModule } from '@nestjs/testing';
import { TelnyxLogService } from './telnyx-log.service';

describe('TelnyxLogService', () => {
  let service: TelnyxLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelnyxLogService],
    }).compile();

    service = module.get<TelnyxLogService>(TelnyxLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

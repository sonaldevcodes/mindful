import { Test, TestingModule } from '@nestjs/testing';
import { TelnyxLogController } from './telnyx-log.controller';
import { TelnyxLogService } from './telnyx-log.service';

describe('TelnyxLogController', () => {
  let controller: TelnyxLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelnyxLogController],
      providers: [TelnyxLogService],
    }).compile();

    controller = module.get<TelnyxLogController>(TelnyxLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

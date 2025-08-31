import { Module } from '@nestjs/common';
import { TelnyxLogService } from './telnyx-log.service';
import { TelnyxLogController } from './telnyx-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelnyxLogEntity } from './entities/telnyx-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TelnyxLogEntity])],
  controllers: [TelnyxLogController],
  providers: [TelnyxLogService],
  exports: [TelnyxLogService],
})
export class TelnyxLogModule {}

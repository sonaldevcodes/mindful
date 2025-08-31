import { Body, Controller, Post } from '@nestjs/common';
import { TelnyxLogService } from './telnyx-log.service';
import { CreateTelnyxLogDto } from './dto/create-telnyx-log.dto';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('telnyx-log')
export class TelnyxLogController {
  constructor(private readonly telnyxLogService: TelnyxLogService) {}

  // Endpoint to create a new Telnyx error log
  @Post('error')
  async createErrorLog(@Body() createTelnyxLogDto: CreateTelnyxLogDto) {
    return this.telnyxLogService.create(createTelnyxLogDto);
  }
}

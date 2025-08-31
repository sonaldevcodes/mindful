import { PartialType } from '@nestjs/swagger';
import { CreateTelnyxLogDto } from './create-telnyx-log.dto';

export class UpdateTelnyxLogDto extends PartialType(CreateTelnyxLogDto) {}

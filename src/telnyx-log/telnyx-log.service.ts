// src/telnyx-log/telnyx-log.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTelnyxLogDto } from './dto/create-telnyx-log.dto';
import { TelnyxLogEntity } from './entities/telnyx-log.entity';

@Injectable()
export class TelnyxLogService {
  constructor(
    @InjectRepository(TelnyxLogEntity)
    private telnyxLogRepository: Repository<TelnyxLogEntity>,
  ) {}

  // Method to log the error details into the database
  async create(createTelnyxLogDto: CreateTelnyxLogDto): Promise<TelnyxLogEntity> {
    const log = this.telnyxLogRepository.create({
      ...createTelnyxLogDto,
      createdAt: new Date(), // Set current timestamp for createdAt
      updatedAt: new Date(), // Set current timestamp for updatedAt
    });
    return await this.telnyxLogRepository.save(log);
  }

  // // Method to get all Telnyx logs
  // async findAll(): Promise<TelnyxLog[]> {
  //   return this.telnyxLogRepository.find();
  // }

  // // Method to get a single Telnyx log by ID
  // async findOne(id: number): Promise<TelnyxLog> {
  //   return this.telnyxLogRepository.findOne(id);
  // }
}

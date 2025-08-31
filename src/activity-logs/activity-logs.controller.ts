import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';
import { ActivityLogService } from './activity-logs.service';
import { SearchPaginationDto } from '../common/dtos/search-pagination.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActivityLogEntity } from './entities/activity-log.entity';
import { GetActivityLogDto } from './dto/get-activity-log.dto';

@ApiTags('Activity Logs')
@Controller('api/activity-logs')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply guards
@Roles('admin', 'user')
export class ActivityLogController {
  constructor(private activityLogService: ActivityLogService) { }

  @ApiOperation({ summary: 'Create an activity log' })
  @ApiResponse({
    status: 201,
    description: 'Activity log has been created successfully',
    type: ActivityLogEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Post()
  createActivityLog(@Body() createDto: CreateActivityLogDto, @Request() req: any) {
    const startedByUserId = req.user.id;
    return this.activityLogService.createActivityLog(createDto, startedByUserId);
  }

  @ApiOperation({ summary: 'Update an activity log' })
  @ApiParam({ name: 'id', description: 'Activity log ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Activity log has been updated successfully',
    type: ActivityLogEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Activity log not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @Put(':id')
  updateActivityLog(@Param('id') id: number, @Request() req: any, @Body() updateDto: UpdateActivityLogDto) {
    const endedByUserId = req.user.id;
    return this.activityLogService.updateActivityLog(id, updateDto, endedByUserId);
  }

  @ApiOperation({ summary: 'Get activity logs with pagination and search' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of records to retrieve' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for filtering results' })
  @ApiResponse({
    status: 200,
    description: 'List of activity logs with pagination and search',
    type: [ActivityLogEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Get()
  getActivityLogs(@Query() searchDto: SearchPaginationDto, @Request() req: any) {
    const userId = req.user.id;
    return this.activityLogService.getActivityLogs(searchDto, userId);
  }

  @Get('weekly-progress')
  @ApiOperation({ summary: 'Get weekly progress' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved weekly progress',
    type: Object, // Replace with a proper DTO if needed
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getWeeklyProgress(@Request() req: any, @Query() getActivityLogDto: GetActivityLogDto) {
    const userId = req.user.id;
    return this.activityLogService.getWeeklyProgress(userId, getActivityLogDto);
  }

  // @Get('weekly-progress-for-target')
  // @ApiOperation({
  //   summary: 'Get weekly progress for a specific user with respect to a target user',
  // })
  // @ApiQuery({ name: 'targetUserId', required: true, description: 'Target user ID' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Successfully retrieved weekly progress for target user',
  //   type: Object, // Replace with a proper DTO if needed
  // })
  // @ApiResponse({ status: 400, description: 'Bad request' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // async getWeeklyProgressForTargetUser(
  //   @Request() req: any,
  //   @Query('targetUserId') targetUserId: number,
  // ) {
  //   const userId = req.user.id;
  //   return this.activityLogService.getWeeklyProgressForTargetUser(userId, targetUserId);
  // }

  @Get('get-logs-for-target-user')
  @ApiOperation({
    summary: 'Get logs with target user',
  })
  @ApiQuery({ name: 'targetUserId', required: true, description: 'Target user ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved weekly progress for target user',
    type: Object, // Replace with a proper DTO if needed
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLogsForTargetUser(
    @Request() req: any,
    @Query('targetUserId') targetUserId: number,
  ) {
    const userId = req.user.id;
    return this.activityLogService.getLogsForTargetUser(userId, targetUserId);
  }

  @ApiOperation({
    summary: 'Get the last activity log for the current user and target user',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the last activity log for the user and target user.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('last-activity')
  async getLastActivity(
    @Query('targetUserId') targetUserId: number, // Target user ID from the query parameters
    @Request() req: any // Request to access the current user's ID
  ) {
    const userId = req.user.id; // Current user ID
    return this.activityLogService.getLastActivityLogForUser(userId, targetUserId);
  }


}

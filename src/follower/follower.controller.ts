import { Controller, Post, Param, Get, UseGuards, Request, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MatchesService } from './follower.service';
import { MatchEntity } from './entities/follower.entity';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Matches')
@Controller('matches')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply guards
@Roles('admin', 'user')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @ApiOperation({ summary: 'Handle swipe between two users' })
  @ApiResponse({ status: 200, description: 'Match created successfully and notifications sent' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Post('swipe/:userBId')
  async handleSwipe(
    @Request() req: any,
    @Param('userBId') userBId: number,
  ): Promise<object> {
    const userAId = req.user.id;
    return this.matchesService.handleSwipe(userAId, userBId);
  }

  @ApiOperation({ summary: 'Get all matches for a user' })
  @ApiResponse({ status: 200, description: 'List of matches', type: [MatchEntity] })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get()
  async getMatches(@Request() req: any) {
    const userId = req.user.id;
    return this.matchesService.getMatches(userId);
  }

  @ApiOperation({ summary: 'Get specific matche' })
  @ApiResponse({ status: 200, description: 'specific matches', type: [MatchEntity] })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('user/with/:userBId')
  async getSpecificMatch(
    @Request() req: any,
    @Param('userBId') userBId: number,
  ) {
    const userAId = req.user.id;
    return this.matchesService.getSpecificMatch(userAId, userBId);
  }

  // @ApiOperation({ summary: 'Update Agora tokens for mutual matches' })
  // @ApiParam({
  //   name: 'userAId',
  //   required: false,
  //   description: 'ID of User A (optional)',
  //   type: Number,
  // })
  // @ApiParam({
  //   name: 'userBId',
  //   required: false,
  //   description: 'ID of User B (optional)',
  //   type: Number,
  // })
  // @Patch('update-agora-tokens/:userAId?/:userBId?')
  // async updateAgoraTokensForMutualMatches(
  //   @Param('userAId') userAId?: number,
  //   @Param('userBId') userBId?: number,
  // ): Promise<void> {
  //   await this.matchesService.updateAgoraTokensForMutualMatches(userAId, userBId);
  // }
}

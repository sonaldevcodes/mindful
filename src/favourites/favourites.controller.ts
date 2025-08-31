import {
  Controller,
  Post,
  Delete,
  Param,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SearchPaginationDto } from '../common/dtos/search-pagination.dto';
import { FavoritesService } from './favourites.service';
import { FavoriteEntity } from './entities/favourite.entity';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Favorites')
@Controller('api/favorites')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply guards
@Roles('admin', 'user')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':userId/:targetUserId')
  @ApiOperation({ summary: 'Favorite a user' })
  @ApiResponse({ status: 201, description: 'User favorited successfully.' })
  @ApiResponse({ status: 409, description: 'User is already in favorites.' })
  async favoriteUser(
    @Request() req: any,
    @Param('targetUserId', ParseIntPipe) targetUserId: number
  ): Promise<FavoriteEntity> {
    const userId = req.user.id;
    return this.favoritesService.favoriteUser(userId, targetUserId);
  }

  @Delete(':userId/:targetUserId')
  @ApiOperation({ summary: 'Unfavorite a user' })
  @ApiResponse({ status: 200, description: 'User unfavorited successfully.' })
  @ApiResponse({ status: 404, description: 'Favorite not found.' })
  async unfavoriteUser(
    @Request() req: any,
    @Param('targetUserId', ParseIntPipe) targetUserId: number
  ): Promise<void> {
    const userId = req.user.id;
    return this.favoritesService.unfavoriteUser(userId, targetUserId);
  }

  @Get('my-favorites')
  @ApiOperation({ summary: 'Get the list of users I have favorited with search and pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of users the current user has favorited.',
    type: [FavoriteEntity],
  })
  async getMyFavorites(
    @Request() req: any,
    @Query() searchPaginationDto: SearchPaginationDto,
  ): Promise<FavoriteEntity[]> {
    const userId = req.user.id;
    return this.favoritesService.getFavoritesForUser(userId, searchPaginationDto);
  }

  @Get('favorited-by')
  @ApiOperation({ summary: 'Get the list of users who have favorited me with search and pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of users who have favorited the current user.',
    type: [FavoriteEntity],
  })
  async getUsersWhoFavoritedMe(
    @Request() req: any,
    @Query() searchPaginationDto: SearchPaginationDto,
  ): Promise<FavoriteEntity[]> {
    const userId = req.user.id;
    return this.favoritesService.getUsersWhoFavoritedUser(userId, searchPaginationDto);
  }
}

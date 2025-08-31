import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './users.service';
import { UserEntity, UserWithEnrichedQuestions } from './infrastructure/persistence/relational/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CustomSearchDto } from '../common/dtos/custom-search-dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthResponseDto } from '../auth/dto/login-auth.dto';

@ApiTags('Users')
@Controller('api/users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply guards
@Roles('admin', 'user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // @Post()
  // @ApiOperation({ summary: 'Create a new user' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'The user has been successfully created.',
  //   type: UserEntity,
  // })
  // createUser(@Headers('authorization') firebaseToken: string, @Body() createUserDto: CreateUserDto): Promise<UserEntity> {
  //   return this.userService.createUser(firebaseToken, createUserDto);
  // }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user with the given ID was found.',
    type: UserWithEnrichedQuestions,
  })
  getUserById(@Param('id') id: number): Promise<UserWithEnrichedQuestions> {
    return this.userService.getUserById(id);
  }

  // @Put('update')
  // @ApiOperation({ summary: 'Update a user by ID' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'The user has been successfully updated.',
  //   type: UserWithEnrichedQuestions,
  // })
  // updateUser(
  //   @Request() req: any,
  //   @Body() updateUserDto: CreateUserDto,
  // ): Promise<UserWithEnrichedQuestions> {
  //   const userId = req.user.id;
  //   return this.userService.updateUser(updateUserDto, userId);
  // }

  @Delete()
  @ApiOperation({ summary: 'Soft delete a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully soft deleted.',
  })
  deleteUser( @Request() req: any): Promise<void> {
    const id = req.user.id;
    return this.userService.deleteUser(id);
  }

  @Post('block/:blockedUserId')
  @ApiOperation({ summary: 'Block a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully blocked.',
  })
  blockUser(
    @Request() req: any,
    @Param('blockedUserId') blockedUserId: number,
  ): Promise<void> {
    const userId = req.user.id;
    return this.userService.blockUser(userId, blockedUserId);
  }

  @Post(':userId/unblock/:blockedUserId')
  @ApiOperation({ summary: 'Unblock a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully unblocked.',
  })
  unblockUser(
    @Request() req: any,
    @Param('blockedUserId') blockedUserId: number, 
  ): Promise<void> {
    const userId = req.user.id;
    return this.userService.unblockUser(userId, blockedUserId);
  }

  @Get('all/blocked/unblocked')
  @ApiOperation({ summary: 'Get all blocked or unblocked users for a given user' })
  @ApiResponse({
    status: 200,
    description: 'List of unblocked users.',
    type: [UserEntity],
  })
  getUnblockedUsers(
    @Request() req: any,
    @Query() searchFilters: CustomSearchDto,
  ): Promise<UserEntity[]> {
    const userId = req.user.id;
    return this.userService.getUnblockedUsers(userId, searchFilters);
  }

}

import { Controller, Post, Body, Param, Patch, Get, Query, Headers, Put, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponseDto, LoginAuthDto } from './dto/login-auth.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserEntity, UserWithEnrichedQuestions } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RolesGuard } from './guard/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { ChangePasswordDto, LoginWithPasswordDto, SendOtpDto } from '../users/dto/send-otp.dto';
import { VerifyOtpDto } from '../users/dto/verify-otp.dto';


@ApiTags('Auth')
@Controller('api/auth')
@ApiBearerAuth('access-token')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  // @UseGuards(JwtAuthGuard, RolesGuard) // Apply guards
  // @Roles('admin', 'user')
  @Post('register')
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully created',
    type: AuthResponseDto
  })
  async register(@Headers('authorization') firebaseToken: string, @Body() createUserDto: CreateUserDto) {
    return await this.authService.registerUser(firebaseToken, createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with Firebase token' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in.',
    type: AuthResponseDto
  })
  async login(
    @Headers('authorization') firebaseToken: string,
    @Body() loginAuthDto: LoginAuthDto,
  ) {
    return await this.authService.login(firebaseToken, loginAuthDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard) // Apply guards
  @Roles('admin', 'user')
  @Put('update')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully updated',
    type: AuthResponseDto
  })
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any
  ): Promise<UserWithEnrichedQuestions> {
    const userId = req.user.id;
    return this.authService.updateUser(userId, updateUserDto, "");
  }


  @UseGuards(JwtAuthGuard, RolesGuard) // Apply guards
  @Roles('admin', 'user')
  @Get('admin-check')
  async checkAdmin(@Request() req: any) {
    const userId = req.user.id;
    return await this.authService.checkAdmin(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard) // Apply guards
  @Roles('admin', 'user')
  @Get('user')
  async findUserById(@Request() req: any) {
    const userId = req.user.id;
    return await this.authService.findUserById(userId);
  }

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to mobile number' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async sendOTP(@Body() sendOTPDto: SendOtpDto) {
    return this.authService.sendOTP(sendOTPDto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP and get user with JWT token' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP or expired' })
  async verifyOTP(@Body() verifyOTPDto: VerifyOtpDto) {
    return this.authService.verifyOTP(
      verifyOTPDto
    );
  }


  @Post('login-password')
  async loginWithPassword(@Body() body: LoginWithPasswordDto) {
    const { mobileNumber, password } = body;
    if (!mobileNumber || !password) {
      throw new BadRequestException('Mobile number and password are required');
    }

    return this.authService.loginWithPassword(mobileNumber, password);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @Post('change-password')
  @ApiOperation({ summary: 'Change password using old password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = req.user.id;
    const { oldPassword, newPassword, confirmPassword } = changePasswordDto;

    return this.authService.changePasswordWithOldPassword(
      userId,
      oldPassword,
      newPassword,
      confirmPassword,
    );
  }

}

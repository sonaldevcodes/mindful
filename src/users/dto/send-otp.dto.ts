import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString, MinLength } from "class-validator";

export class SendOtpDto {
  @ApiProperty({
    description: 'The mobile number of the user',
    example: '2234567890',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  mobileNumber: string;

  @ApiProperty({
    description: 'The ISO code for the user’s mobile number',
    example: 'US',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  isoCode: string;

  @ApiProperty({
    description: 'The country code for the user’s mobile number',
    example: '+1',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty({
    description: 'Indicates whether the user is already exists',
    example: true,
    required: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isSignUp: boolean;
}

export class LoginWithPasswordDto {
  @ApiProperty({
    description: 'The mobile number of the user',
    example: '2234567890',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  mobileNumber: string;

  @ApiProperty({
    description: 'User password',
    example: 'test@123',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPass123!', description: 'Current password' })
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ example: 'NewPass456!', description: 'New password' })
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({ example: 'NewPass456!', description: 'Confirm new password' })
  @IsNotEmpty()
  @MinLength(8)
  confirmPassword: string;
}
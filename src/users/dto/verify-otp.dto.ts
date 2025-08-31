import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
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
    description: 'otp code',
    example: '123456',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;

  @ApiProperty({
    description: 'password',
    example: 'test@123'
  })
  @IsString()
  @IsOptional()
  @Length(8)
  password?: string;

  @ApiProperty({
    description: 'confirm password',
    example: 'test@123'
  })
  @IsString()
  @IsOptional()
  @Length(8)
  confirmPassword?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';

export class LoginAuthDto {
  @ApiProperty({ description: 'Mobile number of the user', example: '+1234567890' })
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
    description: 'The fcm token for send notification',
    example: 'token',
    required: true,
  })
  @IsOptional()
  @IsString()
 
  // @IsNotEmpty()
  fcmToken: string;
}


export class AuthResponseDto {

  @ApiProperty()
  jwtToken: string;

  @ApiProperty()
  user: UserEntity;

}
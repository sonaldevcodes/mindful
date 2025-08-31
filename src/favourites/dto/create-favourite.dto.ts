import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFavoriteDto {
  @ApiProperty({ description: 'The ID of the user who is adding the favorite.' })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: 'The ID of the user who is being favorited.' })
  @IsInt()
  @IsNotEmpty()
  favoriteUserId: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';

export class UpdateFavoriteDto {
  @ApiProperty({ description: 'ID of the user who is updating the favorite.', required: false })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({ description: 'ID of the user being updated as a favorite.', required: false })
  @IsOptional()
  @IsInt()
  favoriteUserId?: number;
}

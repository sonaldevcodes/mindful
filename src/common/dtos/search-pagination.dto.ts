import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class SearchPaginationDto {
  @ApiPropertyOptional({ description: 'Search term for querying favorites', example: 'John Doe' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Search term for querying favorites'})
  @IsOptional()
  @IsString()
  searchFilters?: { [column: string]: string };

  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  // @IsInt()
  // @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of records to skip', example: 0 })
  @IsOptional()
  // @IsInt()
  // @Min(0)
  offset?: number;

  @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
  @IsOptional()
  // @IsInt()
  // @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Targeted user id', example: 1 })
  @IsOptional()
  targetedId?: number
}

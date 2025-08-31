import { IsOptional, IsString, IsNumber, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FilterFollowersDto {
    @ApiProperty({ description: 'userId', required: true })
    @IsNotEmpty()
    @IsNumber()
    userId: number;

    @ApiProperty({ description: 'Minimum age of the followers', required: false })
    @IsOptional()
    @IsNumber()
    minAge?: number;

    @ApiProperty({ description: 'Maximum age of the followers', required: false })
    @IsOptional()
    @IsNumber()
    maxAge?: number;

    @ApiProperty({ description: 'Minimum height of the followers', required: false })
    @IsOptional()
    @IsNumber()
    minHeight?: number;

    @ApiProperty({ description: 'Maximum height of the followers', required: false })
    @IsOptional()
    @IsNumber()
    maxHeight?: number;

    @ApiProperty({ description: 'Languages spoken by the followers', required: false, type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: false })
    languages?: string[];

    @ApiProperty({ description: 'Latitude', required: false  })
    @IsOptional()
    @IsNumber()
    latitude: number;

    @ApiProperty({ description: 'Longitude', required: false  })
    @IsOptional()
    @IsNumber()
    longitude: number;

    @ApiProperty({ description: 'Distance from the user', required: false })
    @IsOptional()
    @IsNumber()
    distance?: number;

    @ApiProperty({ description: 'Sexuality of the followers', required: false })
    @IsOptional()
    @IsString()
    sexuality?: string;

    @ApiProperty({ description: 'Minimum weight of the followers', required: false })
    @IsOptional()
    @IsNumber()
    minWeight?: number;

    @ApiProperty({ description: 'Maximum weight of the followers', required: false })
    @IsOptional()
    @IsNumber()
    maxWeight?: number;
}

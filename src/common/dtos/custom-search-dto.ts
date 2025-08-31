import { ApiProperty, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsObject,
  IsArray,
} from 'class-validator';
import { Blocked_UnBlocked } from '../../users/enum/blocked-unblocked.enum';
import { Language } from '../../users/enum/language.enum';
import { RaceEnum } from '../../users/enum/race.enum';
import { SexualIdentity } from '../../users/enum/sexual-identity.enum';
import { Transform, Type } from 'class-transformer';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class CustomSearchDto {
  @ApiProperty({
    description: 'Latitude for location-based search',
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({
    description: 'Get Blocked or Un-blocked user',
    required: true,
    enum: Blocked_UnBlocked,
    default: Blocked_UnBlocked.BLOCKED,
  })
  @IsOptional()
  @IsEnum(Blocked_UnBlocked)
  userDataType?: Blocked_UnBlocked;

  @ApiProperty({
    description: 'Longitude for location-based search',
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({
    description: 'Radius in miles for location-based search',
    required: false,
    type: Number,
  })
  @IsOptional()
  // @IsNumber()
  radius?: number;

  @ApiProperty({
    description: 'Number of records to return',
    required: false,
    default: 10,
    type: Number,
  })
  @IsOptional()
  // @IsNumber()
  limit?: number;

  @ApiProperty({
    description: 'Number of records to skip',
    required: false,
    default: 0,
    type: Number,
  })
  @IsOptional()
  // @IsNumber()
  offset?: number;

  @ApiProperty({
    description:
      'Search filters where each key is a column name and value is the search string',
    required: false,
    type: 'object',
    additionalProperties: {
      type: 'string',
    },
  })
  @IsOptional()
  @IsObject()
  searchFilter?: { [column: string]: string };

  @ApiProperty({
    description: 'Column to sort by',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: 'Sort order, either ASC or DESC',
    required: false,
    enum: SortOrder,
    default: SortOrder.ASC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiProperty({
    description: 'Sort order, either ASC or DESC',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => +value)
  @IsNumber()
  minAge?: number;

  @ApiProperty({
    description: 'Sort order, either ASC or DESC',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => +value)
  @IsNumber()
  maxAge?: number;
  
  @ApiProperty({
    description: 'Sort order, either ASC or DESC',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => +value)
  @IsNumber()
  minWeight?: number;

  @ApiProperty({
    description: 'Sort order, either ASC or DESC',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => +value)
  @IsNumber()
  maxWeight?: number;

  @ApiProperty({
    description: 'Sort order, either ASC or DESC',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => +value)
  @IsNumber()
  minHeight?: number;
  @ApiProperty({
    description: 'Sort order, either ASC or DESC',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => +value)
  @IsNumber()
  maxHeight?: number;

  @ApiProperty({
    description: 'Language filter',
    // enum: Language,
    type: [String],
    isArray: true,
    // example: [Language.ENGLISH, Language.SPANISH],
    example: ['english', 'spanish'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  // @IsEnum(Language, { each: true })
  languages?: Language[];

  @ApiProperty({
    description: 'Language filter',
    // enum: Language,
    type: [String],
    isArray: true,
    // example: [Language.ENGLISH, Language.SPANISH],
    example: ['english', 'spanish'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  // @IsEnum(Language, { each: true })
  race?: RaceEnum[];
  
  @ApiProperty({
    description: 'Language filter',
    // enum: Language,
    type: [String],
    isArray: true,
    // example: [Language.ENGLISH, Language.SPANISH],
    example: ['english', 'spanish'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  // @IsEnum(Language, { each: true })
  sexuality?: SexualIdentity[];



  // @ApiProperty({
  //   description: 'Age filter in the format: minAge-maxAge',
  //   example: '18-24,34-30',
  //   required: false,
  // })
  // @IsOptional()
  // @IsString()
  // age?: string;

  // @ApiProperty({
  //   description: 'Height filter in the format: minHeight-maxHeight (in feet)',
  //   example: '5\'5"-5\'7",5\'7"-5\'8"',
  //   required: false,
  // })
  // @IsOptional()
  // @IsString()
  // height?: string;

  // @ApiProperty({
  //   description: 'Language filter',
  //   enum: Language,
  //   isArray: true,
  //   example: [Language.ENGLISH, Language.SPANISH],
  //   required: false,
  // })
  // @IsOptional()
  // @IsArray()
  // @IsEnum(Language, { each: true })
  // languages?: Language[];

  // @ApiProperty({
  //   description: 'Distance filter in kilometers',
  //   example: '35-40',
  //   required: false,
  // })
  // @IsOptional()
  // @IsString()
  // distance?: string;

  // @ApiProperty({
  //   description: 'Race filter',
  //   enum: RaceEnum,
  //   example: [RaceEnum.AFRICAN],
  //   required: false,
  // })
  // @IsOptional()
  // @IsArray()
  // @IsEnum(RaceEnum, { each: true })
  // race?: RaceEnum[];

  // @ApiProperty({
  //   description: 'Sexual identity filter',
  //   enum: SexualIdentity,
  //   example: [SexualIdentity.LESBIAN],
  //   required: false,
  // })
  // @IsOptional()
  // @IsArray()
  // @IsEnum(SexualIdentity, { each: true })
  // sexuality?: SexualIdentity[];

  // @ApiProperty({
  //   description: 'Weight filter in the format: minWeight-maxWeight (in kg)',
  //   example: '71.9-72.2',
  //   required: false,
  // })
  // @IsOptional()
  // @IsString()
  // weight?: string;
}

@ApiExtraModels(CustomSearchDto)
export class SearchPaginationDto {
  @ApiProperty({
    description: 'Search filters and pagination',
    type: CustomSearchDto,
  })
  @IsOptional()
  searchFilters?: CustomSearchDto;
}

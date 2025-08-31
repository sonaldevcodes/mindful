import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDate,
  IsEnum,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
  IsLatitude,
  IsLongitude,
  IsBoolean,
  IsPhoneNumber,
  isNotEmpty,
  IsNotEmpty,
  isEnum,
  MaxLength,
  Validate,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Frequency } from '../enum/frequency.enum';
import { Duration } from '../enum/duration.enum';
import { Diet } from '../enum/diet.enum';
import { Alcohol } from '../enum/alcohol.enum';
import { Smoking } from '../enum/smoking.enum';
import { SexualIdentity } from '../enum/sexual-identity.enum';
import { RelationshipSeeking } from '../enum/relationship-seeking.enum';
import { EnergyRepresents } from '../enum/energy.represents.enums';
import { EducationLevel } from '../enum/education-level.enum';
import { StarSign } from '../enum/star-sign.enum';
import { Religion } from '../enum/religion.enum';
import { Occupation } from '../enum/occu.enum';
import { Language } from '../enum/language.enum';
import { Role } from '../enum/role.enum';
import { PetEnum } from '../enum/pets.enum';
import { EnjoyActivity } from '../enum/enjoy-activity.enum';
import { RaceEnum } from '../enum/race.enum';
import { IsNumberOrStringNumber } from '../../utils/deorators/IsNumberOrStringNumber';
import { MeasurementUnits } from '../enum/measurement-unit.enum';
import { EnergyLookingFor } from '../enum/energy.looking.for.enum';

class SpiritualPracticesDto {
  @ApiProperty({
    description: 'The IDs of the activities associated with the user',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsOptional()
  @IsArray()
  @Validate(IsNumberOrStringNumber, { each: true })
  @Transform(({ value }) =>
    value.map((val: any) => (typeof val === 'string' ? Number(val) : val)),
  )
  // @IsNumber({}, { each: true })
  activities: string[];

  @IsOptional()
  @IsEnum(Frequency)
  frequency: Frequency;

  @IsOptional()
  @IsEnum(Duration)
  duration: Duration;

  @IsOptional()
  @IsArray()
  goals: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(EnergyRepresents, { each: true })
  energyRepresents: EnergyRepresents[];

  @IsOptional()
  @IsArray()
  @IsEnum(EnergyLookingFor, { each: true })
  energyLookingFor: EnergyLookingFor[];
  // @IsBoolean()
  // seekingPartnerForHealing: boolean;

  // @IsString()
  // pastExperienceOrTraumas: string;

  // @IsString()
  // spiritualityInDailyLife: string;

  // @IsString()
  // spiritualityInRelationships: string;
  @IsOptional()
  @IsArray()
  questionnaire: { questionId: number; answer: string }[];
}

class LifestylePreferencesDto {
  @ApiProperty({
    description: 'Dietary preferences of the user',
    enum: Diet,
    example: 'vegan',
  })
  @IsOptional()
  @IsEnum(Diet)
  diet: Diet;

  @ApiProperty({
    description: 'Alcohol consumption frequency',
    enum: Alcohol,
    example: 'never',
  })
  @IsOptional()
  @IsEnum(Alcohol)
  alcohol: Alcohol;

  @ApiProperty({
    description: 'Smoking frequency',
    enum: Smoking,
    example: 'non_smoker',
  })
  @IsOptional()
  @IsEnum(Smoking)
  smoking: Smoking;

  @ApiProperty({
    description: 'Activities enjoyed in free time',
    enum: EnjoyActivity,
    example: ['hiking', 'reading'],
  })
  @IsOptional()
  //   @IsEnum(EnjoyActivity)
  freeTimeActivities: EnjoyActivity;

  @ApiProperty({
    description: 'Pets owned or loved by the user',
    enum: PetEnum,
    example: ['dog', 'cat'],
  })
  @IsOptional()
  //   @IsEnum(PetEnum)
  pets: PetEnum;

  @IsOptional()
  @IsString()
  @MaxLength(1000, {
    message: 'The about section should not exceed 1000 words.',
  })
  @ApiProperty({
    description:
      'A brief description or about section for the user, limited to 1000 words.',
    required: false,
  })
  about: string;
}

class PersonalDetailsDto {
  @ApiProperty({
    description: 'Education level of the user',
    example: EducationLevel.BACHELORS_DEGREE,
  })
  @IsOptional()
  @IsEnum(EducationLevel)
  educationLevel: EducationLevel;

  @ApiProperty({
    description: 'Occupation of the user',
    enum: Occupation,
    example: Occupation.SOFTWARE_DEVELOPER,
  })
  @IsOptional()
  @IsEnum(Occupation)
  occupation: Occupation;

  @ApiProperty({
    description: 'Languages spoken by the user',
    enum: Language,
    isArray: true,
    example: [Language.ENGLISH, Language.SPANISH],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Language, { each: true })
  languages: Language[];

  @ApiProperty({
    description: 'Star sign of the user',
    example: StarSign.GEMINI,
  })
  @IsOptional()
  @IsEnum(StarSign)
  starSign: StarSign;

  @ApiProperty({
    description: 'Religion of the user',
    example: Religion.CHRISTIANITY,
  })
  @IsOptional()
  @IsEnum(Religion)
  religion: Religion;

  @ApiProperty({
    description: 'Height of the user',
    example: 40,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  height: number;

  @ApiProperty({
    description: 'Weight of the user in kg',
    example: 70,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  weight: number;

  @ApiProperty({
    description: 'race of the user',
    example: RaceEnum.AFRICAN_AMERICAN_BLACK,
  })
  @IsOptional()
  @IsEnum(RaceEnum)
  race: RaceEnum;
}

class PhotoDto {
  @ApiProperty({
    description: 'Photo ID',
    example: '12345',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'URL of the photo',
    example: 'http://example.com/photo.jpg',
  })
  @IsString()
  url: string;
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'The mobile number of the user',
    example: '+1234567890',
    required: true,
  })
  @IsOptional()
  @IsString()
  mobileNumber: string;

  @ApiProperty({
    description: 'The ISO code for the user’s mobile number',
    example: 'US',
    required: true,
  })
  @IsOptional()
  @IsString()
  isoCode: string;

  @ApiProperty({
    description: 'The country code for the user’s mobile number',
    example: '+1',
    required: true,
  })
  @IsString()
  @IsOptional()
  countryCode: string;

  @ApiProperty({ description: 'Role of the user', example: Role.USER })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
  
  @ApiProperty({ description: 'Measurement units of the user', example: MeasurementUnits.METRIC })
  @IsOptional()
  @IsEnum(MeasurementUnits)
  measurementUnits?: MeasurementUnits;


  @ApiProperty({
    description: 'Firebase token for verification',
    example: 'firebase_token',
  })
  @IsString()
  @IsOptional()
  firebaseToken?: string;

  @ApiProperty({ description:  'agoraToken for verification', example: 'agoraToken' })
  @IsString()
  @IsOptional()
  agoraToken?: string;

  @ApiProperty({
    description: 'fcmToken for notification',
    example: 'fcmToken',
  })
  @IsString()
  @IsOptional()
  fcmToken?: string;

  @ApiProperty({ description: 'Is the user blocked?', example: false })
  @IsBoolean()
  @IsOptional()
  isBlocked?: boolean;

  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  fullName: string;

  @ApiProperty({
    description: 'The birthday of the user',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : value))
  birthday: Date;

  @ApiProperty({
    description: 'The sexual identity of the user',
    enum: SexualIdentity,
    example: 'lesbian',
  })
  @IsOptional()
  @IsEnum(SexualIdentity)
  sexualIdentity: SexualIdentity;

  @ApiProperty({
    description: 'The relationship seeking preferences of the user',
    enum: RelationshipSeeking,
    type: [String],
    example: ['Soulful fling'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(RelationshipSeeking, { each: true })
  relationshipSeeking: RelationshipSeeking[];

  @ApiProperty({
    description: 'The spiritual practices of the user',
    type: SpiritualPracticesDto,
    example: {
      activities: [1, 2],
      frequency: 'daily',
      duration: '30_minutes',
      goals: ['stress relief', 'emotional healing'],
      energyRepresents: ['balanced', 'feminine'],
      energyLookingFor: ['balanced', 'feminine'],
      questionnaire: [{ questionId: 1, answer: 'yes' }],
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SpiritualPracticesDto)
  spiritualPractices: SpiritualPracticesDto;

  @ApiProperty({
    description: 'The lifestyle preferences of the user',
    type: LifestylePreferencesDto,
    example: {
      diet: 'vegan',
      alcohol: 'never',
      smoking: 'non_smoker',
      freeTimeActivities: ['hiking', 'reading'],
      pets: ['dog', 'cat'],
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LifestylePreferencesDto)
  lifestylePreferences: LifestylePreferencesDto;

  @ApiProperty({
    description: 'The personal details of the user',
    type: PersonalDetailsDto,
    example: {
      educationLevel: 'Bachelor’s degree',
      occupation: 'Software Developer',
      languages: ['English', 'Spanish'],
      starSign: 'Gemini',
      religion: 'Christianity',
      height: '5 feet 9 inches',
      weight: 70,
      race: 'african',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PersonalDetailsDto)
  personalDetails: PersonalDetailsDto;

  @ApiProperty({
    description: 'The photo details of the user.',
    type: [PhotoDto],
    example: [
      {
        id: '12345',
        url: 'http://example.com/photo1.jpg',
      },
      {
        id: '67890',
        url: 'http://example.com/photo2.jpg',
      },
    ],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PhotoDto)
  photos: PhotoDto[];

  @ApiProperty({
    description: 'The latitude of the user’s location',
    example: 40.712776,
  })
  @IsOptional()
  @IsNumber()
  lat: number;

  @ApiProperty({
    description: 'The longitude of the user’s location',
    example: -74.005974,
  })
  @IsOptional()
  @IsNumber()
  lon: number;

  @ApiProperty({
    description: 'The address of the user',
    example: '123 Main St, New York, NY',
  })
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty({
    description: 'The radius of the user',
    example: '30 mi',
  })
  @IsOptional()
  @IsString()
  radius: string;
}

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  Unique,
  OneToMany,
} from 'typeorm';
import { SexualIdentity } from '../../../../enum/sexual-identity.enum';
import { RelationshipSeeking } from '../../../../enum/relationship-seeking.enum';
import { Frequency } from '../../../../enum/frequency.enum';
import { Duration } from '../../../../enum/duration.enum';
import { Diet } from '../../../../enum/diet.enum';
import { Alcohol } from '../../../../enum/alcohol.enum';
import { Smoking } from '../../../../enum/smoking.enum';
import { ActivityEntity } from '../../../../../activities/entities/activity.entity';
import { Role } from '../../../../enum/role.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Occupation } from '../../../../enum/occu.enum';
import { Language } from '../../../../enum/language.enum';
import { FavoriteEntity } from '../../../../../favourites/entities/favourite.entity';
import { EducationLevel } from '../../../../enum/education-level.enum';
import { StarSign } from '../../../../enum/star-sign.enum';
import { Religion } from '../../../../enum/religion.enum';
import { RaceEnum } from '../../../../enum/race.enum';
import { PetEnum } from '../../../../enum/pets.enum';
import { EnjoyActivity } from '../../../../enum/enjoy-activity.enum';
import { EnergyRepresents } from '../../../../enum/energy.represents.enums';
import { NotificationEntity } from '../../../../../notification/entities/notification.entity';
import { MeasurementUnits } from '../../../../enum/measurement-unit.enum';
import { EnergyLookingFor } from '../../../../enum/energy.looking.for.enum';


@Entity('users')
@Unique(['mobileNumber'])
export class UserEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier of the user.' })
  id: number;

  @Column()
  @ApiProperty({ description: 'The mobile number of the user.' })
  mobileNumber: string;

  @Column()
  @ApiProperty({ description: 'The ISO code of the mobile number.' })
  isoCode: string;

  @Column()
  @ApiProperty({ description: 'The country code of the mobile number.' })
  countryCode: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The full name of the user.', required: false })
  fullName: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'User password', required: false })
  password: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The birthday of the user.', required: false })
  birthday: Date;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Otp' })
  otp: string;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({ description: 'Otp expiry time' })
  otpExpiryTime: Date | null;

  @Column({
    type: 'enum',
    enum: SexualIdentity,
    nullable: true
  })
  @ApiProperty({
    description: 'The sexual identity of the user.',
    enum: SexualIdentity,
    required: false
  })
  sexualIdentity: SexualIdentity;

  @Column({
    type: 'enum',
    enum: RelationshipSeeking,
    array: true,
    nullable: true
  })
  @ApiProperty({
    description: 'The relationship seeking preferences of the user.',
    enum: RelationshipSeeking,
    isArray: true,
    required: false
  })
  relationshipSeeking: RelationshipSeeking[];

  @Column('jsonb', { nullable: true })
  @ApiProperty({
    description: 'The spiritual practices of the user and ignore the text field under the questionnaire object, since that will be used for internal checks',
    type: Object,
    required: false
  })
  spiritualPractices: {
    activities: string[];
    frequency: Frequency;
    duration: Duration;
    goals: string[];
    energyRepresents: EnergyRepresents[];
    energyLookingFor: EnergyLookingFor[]
    // spiritualityInDailyLife: string;
    // spiritualityInRelationships: string;
    // pastExperienceOrTraumas?: string;
    questionnaire: { questionId: number; answer: string, text: string }[];
  };

  @Column('jsonb', { nullable: true })
  @ApiProperty({
    description: 'The lifestyle preferences of the user.',
    type: Object,
    required: false
  })
  lifestylePreferences: {
    diet: Diet;
    alcohol: Alcohol;
    smoking: Smoking;
    freeTimeActivities: EnjoyActivity;
    pets: PetEnum;
    about: string
  };

  @Column('jsonb', { nullable: true })
  @ApiProperty({
    description: 'The personal details of the user.',
    type: Object,
    required: false
  })
  personalDetails: {
    educationLevel: EducationLevel;
    occupation: Occupation;
    languages: Language[];
    starSign: StarSign;
    religion: Religion;
    height: number;
    weight: number;
    race: RaceEnum
  };

  @Column('jsonb', { nullable: true })
  @ApiProperty({
    description: 'The photos of the user.',
    type: [Object],
    required: false,
  })
  photos: {
    id: string;
    url: string;
  }[];

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    description: 'A brief description or about section for the user, limited to 1000 words.',
    required: false,
  })
  about: string;

  @Column({ nullable: true, type: 'float' })
  @ApiProperty({ description: 'The latitude coordinate of the user location.', required: false })
  lat: number;

  @Column({ nullable: true, type: 'float' })
  @ApiProperty({ description: 'The longitude coordinate of the user location.', required: false })
  lon: number;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The address of the user.', required: false })
  address: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The radius of the user location.', required: false })
  radius: string;

  @ManyToMany(() => ActivityEntity, {
    eager: true,
  })
  @JoinTable()
  @ApiProperty({
    description: 'The activities associated with the user.',
    type: [ActivityEntity],
    required: false
  })
  activities: ActivityEntity[];

  @Column({ default: false })
  @ApiProperty({ description: 'Indicates if the user is deleted.', default: false })
  isDeleted: boolean;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  @ApiProperty({
    description: 'The role of the user.',
    enum: Role,
    default: Role.USER
  })
  role: Role;

  @Column({ type: 'enum', enum: MeasurementUnits, default: MeasurementUnits.METRIC })
  @ApiProperty({
    description: 'The measurement units of the user.',
    enum: MeasurementUnits,
    default: MeasurementUnits.METRIC
  })
  measurementUnits: MeasurementUnits;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The Firebase token of the user.', required: false })
  firebaseToken: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'fcm token of the user.', required: false })
  fcmToken: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'agoraToken of the user.', required: false })
  agoraToken: string;


  @ManyToMany(() => UserEntity)
  @JoinTable({
    name: 'blocked_users',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'blocked_user_id', referencedColumnName: 'id' },
  })
  @ApiProperty({
    description: 'The users blocked by this user.',
    type: [UserEntity],
    required: false
  })
  blockedUsers: UserEntity[];

  @OneToMany(() => FavoriteEntity, (favorite) => favorite.user)
  @ApiProperty({
    type: () => [FavoriteEntity],
    description: 'List of users this user has favorited',
  })
  favorites: FavoriteEntity[];
  blockedAt: any;
  user: any;

  @OneToMany(() => NotificationEntity, (notification) => notification.userAId)
  sentNotifications: NotificationEntity[]

  @OneToMany(() => NotificationEntity, (notification) => notification.userBId)
  receivedNotifications: NotificationEntity[]
}

export class EnrichedQuestion {
  @ApiProperty({ description: 'The ID of the question.' })
  questionId: number;

  @ApiProperty({ description: 'The text of the question.' })
  text: string;

  @ApiProperty({ description: 'The user’s answer to the question.' })
  answer: string;
}

export class UserWithEnrichedQuestions {
  @ApiProperty({ type: () => UserEntity, description: 'The user entity.' })
  user: UserEntity;

  // @ApiProperty({ type: [EnrichedQuestion], description: 'The enriched questions with answers.' })
  // enrichedQuestions: EnrichedQuestion[];
}

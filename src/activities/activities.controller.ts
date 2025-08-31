import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ActivityEntity } from './entities/activity.entity';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActivityService } from './activities.service';
import { SexualIdentity } from '../users/enum/sexual-identity.enum';
import { RelationshipSeeking } from '../users/enum/relationship-seeking.enum';
import { EnergyRepresents } from '../users/enum/energy.represents.enums';
import { Goals } from '../users/enum/goals.enum';
import { Diet } from '../users/enum/diet.enum';
import { Alcohol } from '../users/enum/alcohol.enum';
import { Smoking } from '../users/enum/smoking.enum';
import { Duration } from '../users/enum/duration.enum';
import { Frequency } from '../users/enum/frequency.enum';
import { EducationLevel } from '../users/enum/education-level.enum';
import { Occupation } from '../users/enum/occu.enum';
import { Language } from '../users/enum/language.enum';
import { StarSign } from '../users/enum/star-sign.enum';
import { Religion } from '../users/enum/religion.enum';
import { EnjoyActivity } from '../users/enum/enjoy-activity.enum';
import { PetEnum } from '../users/enum/pets.enum';
import { RaceEnum } from '../users/enum/race.enum';
import { QuestionnaireService } from '../questionnaire/questionnaire.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EnergyLookingFor } from '../users/enum/energy.looking.for.enum';

@ApiTags('Activities')
@Controller('api/activities')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply guards
@Roles('admin', 'user')
export class ActivityController {
  constructor(private readonly activityService: ActivityService, private readonly QuestionnaireService: QuestionnaireService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new activity' })
  @ApiResponse({
    status: 201,
    description: 'The activity has been successfully created.',
    type: ActivityEntity,
  })
  createActivity(@Body() createActivityDto: CreateActivityDto): Promise<ActivityEntity> {
    return this.activityService.createActivity(createActivityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all activity types' })
  @ApiResponse({
    status: 200,
    description: 'Provides the activity types',
    type: ActivityEntity,
  })
  getActivities(): Promise<ActivityEntity[]> {
    return this.activityService.getActivities();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an activity by ID' })
  @ApiResponse({
    status: 200,
    description: 'The activity has been successfully updated.',
    type: ActivityEntity,
  })
  updateActivity(
    @Param('id') id: number,
    @Body() updateActivityDto: CreateActivityDto,
  ): Promise<ActivityEntity> {
    return this.activityService.updateActivity(id, updateActivityDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an activity by ID' })
  @ApiResponse({
    status: 200,
    description: 'The activity has been successfully deleted.',
  })
  deleteActivity(@Param('id') id: number): Promise<void> {
    return this.activityService.deleteActivity(id);
  }

  @Get('onBoardingData')
  async getOnBoardingData() {
    // Await all asynchronous operations
    const activities = await this.activityService.getActivities();
    const questionnaire = await this.QuestionnaireService.findAll();

    return {
      sexualIdentities: SexualIdentity,
      relationshipSeeking: RelationshipSeeking,
      activityTypes: activities, 
      representsYou: EnergyRepresents,
      energyLookingFor: EnergyLookingFor,
      practices: Frequency, 
      practicingFrequency: Frequency,
      practicingSince: Duration,
      goalsForPractices: Goals,
      questions: questionnaire, 
      dieteryPref: Diet,
      alcohol: Alcohol,
      smoke: Smoking,
      enjoyActivity: EnjoyActivity,
      havePets: PetEnum,
      education: EducationLevel,
      occupation: Occupation,
      language: Language,
      starSign: StarSign,
      religion: Religion,
      race: RaceEnum
    };
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityEntity } from './entities/activity.entity';
import { ActivityController } from './activities.controller';
import { ActivityService } from './activities.service';
import { QuestionService } from '../questionnaire/questions/question.service';
import { Question } from '../questionnaire/questions/question.entity';
import { QuestionnaireService } from '../questionnaire/questionnaire.service';
import { Questionnaire } from '../questionnaire/entities/questionnaire.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityEntity, Question, Questionnaire])],
  controllers: [ActivityController],
  providers: [ActivityService, QuestionService, QuestionnaireService],
  exports: [ActivityService, QuestionService, QuestionnaireService],
})
export class ActivitiesModule {}

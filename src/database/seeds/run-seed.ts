import { DataSource } from 'typeorm';
import { UserSeed } from './create-user.seed';
import { ActivitySeed } from './activities.seed';
import { QuestionSeed } from './questions.seed';
import { QuestionnaireSeed } from './questionnaire.seed';

export class SeedRunner {
  async run(dataSource: DataSource) {
    await new UserSeed().run(dataSource);
    await new ActivitySeed().run(dataSource);
    await new QuestionSeed().run(dataSource);
    await new QuestionnaireSeed().run(dataSource);
  }
}
import { DataSource } from 'typeorm';
import { Question } from '../../questionnaire/questions/question.entity';
import { QuestionType } from '../../questionnaire/questionstype.enum';

export class QuestionSeed {
  async run(dataSource: DataSource) {
    const questionRepository = dataSource.getRepository(Question);

    const questions = [
      {
        text: 'What role does spirituality play in your relationships?',
        type: QuestionType.TEXT,
        options: '',
      },
      {
        text: 'How do you incorporate spirituality into your daily life?',
        type: QuestionType.TEXT,
        options: '',
      },
      {
        text: 'Are you seeking a partner for mutual healing and emotional support?',
        type: QuestionType.SINGLE_CHOICE,
        options: 'Yes,No',
      },
      {
        text: 'What past experiences or traumas are you looking to heal?',
        type: QuestionType.TEXT,
        options: '',
      },
      {
        text: 'What is the importance of your partner sharing in these activities?',
        type: QuestionType.TEXT,
        options: '',
      },
    ];

    for (const question of questions) {
      // Check if the question already exists
      const existingQuestion = await questionRepository.findOne({
        where: { text: question.text },
      });

      if (!existingQuestion) {
        await questionRepository.save(question);
        console.log(`Question "${question.text}" created.`);
      } else {
        console.log(`Question "${question.text}" already exists. Skipping.`);
      }
    }
  }
}

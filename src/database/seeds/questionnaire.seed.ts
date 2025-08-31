import { DataSource } from 'typeorm';
import { Questionnaire } from '../../questionnaire/entities/questionnaire.entity';
import { Question } from '../../questionnaire/questions/question.entity';

export class QuestionnaireSeed {
  async run(dataSource: DataSource) {
    const questionnaireRepository = dataSource.getRepository(Questionnaire);
    const questionRepository = dataSource.getRepository(Question);

    // Get questions from the database (assuming these are already seeded)
    const questions = await questionRepository.find();
    const questionnaires = [
      {
        title: 'Onboarding',
        questionIds: questions.map((q) => q.id), // Extract only the question IDs
      },
    ];

    for (const questionnaire of questionnaires) {
      // Check if the questionnaire already exists
      const existingQuestionnaire = await questionnaireRepository.findOne({
        where: { title: questionnaire.title },
        relations: ['questions'], // If you want to ensure the questions are fetched
      });

      if (!existingQuestionnaire) {
        // Find the questions based on the extracted IDs
        const questionnaireQuestions = await questionRepository.findByIds(questionnaire.questionIds);
        
        // Create a new questionnaire entity
        const newQuestionnaire = questionnaireRepository.create({
          title: questionnaire.title,
          questions: questionnaireQuestions, // Assign the found questions
        });

        await questionnaireRepository.save(newQuestionnaire);
        console.log(`Questionnaire "${questionnaire.title}" created.`);
      } else {
        console.log(`Questionnaire "${questionnaire.title}" already exists. Skipping.`);
      }
    }
  }
}

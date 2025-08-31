import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';
import { Question } from './questions/question.entity';
import { Questionnaire } from './entities/questionnaire.entity';
@Injectable()
export class QuestionnaireService {
  constructor(
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  async create(createQuestionnaireDto: CreateQuestionnaireDto): Promise<Questionnaire> {
    const { questionIds, ...rest } = createQuestionnaireDto;
    const questionnaire = this.questionnaireRepository.create(rest);
    
    if (questionIds && questionIds.length) {
      const questions = await this.questionRepository.findByIds(questionIds);
      questionnaire.questions = questions;
    }

    return this.questionnaireRepository.save(questionnaire);
  }

  async findAll(): Promise<Questionnaire[]> {
    return this.questionnaireRepository.find({ relations: ['questions'] });
  }

  async findOne(id: number): Promise<Questionnaire> {
    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id },
      relations: ['questions'],
    });
    if (!questionnaire) {
      throw new NotFoundException('Questionnaire not found');
    }
    return questionnaire;
  }

  async update(id: number, updateQuestionnaireDto: UpdateQuestionnaireDto): Promise<Questionnaire> {
    const questionnaire = await this.findOne(id);
    const { questionIds, ...rest } = updateQuestionnaireDto;

    if (questionIds && questionIds.length) {
      const questions = await this.questionRepository.findByIds(questionIds);
      questionnaire.questions = questions;
    }

    Object.assign(questionnaire, rest);
    return this.questionnaireRepository.save(questionnaire);
  }

  async remove(id: number): Promise<void> {
    const result = await this.questionnaireRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Questionnaire not found');
    }
  }
}

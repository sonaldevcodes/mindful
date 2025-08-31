import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { QuestionnaireService } from './questionnaire.service';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';
import { Questionnaire } from './entities/questionnaire.entity';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Questionnaires')
@Controller('api/questionnaires')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply guards
@Roles('admin', 'user')
export class QuestionnaireController {
  constructor(private readonly questionnaireService: QuestionnaireService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new questionnaire' })
  @ApiResponse({ status: 201, description: 'Questionnaire successfully created.', type: Questionnaire })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(@Body() createQuestionnaireDto: CreateQuestionnaireDto): Promise<Questionnaire> {
    return this.questionnaireService.create(createQuestionnaireDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all questionnaires' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved all questionnaires.', type: [Questionnaire] })
  async findAll(): Promise<Questionnaire[]> {
    return this.questionnaireService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a questionnaire by ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved the questionnaire.', type: Questionnaire })
  @ApiResponse({ status: 404, description: 'Questionnaire not found.' })
  async findOne(@Param('id') id: number): Promise<Questionnaire> {
    return this.questionnaireService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a questionnaire by ID' })
  @ApiResponse({ status: 200, description: 'Questionnaire successfully updated.', type: Questionnaire })
  @ApiResponse({ status: 404, description: 'Questionnaire not found.' })
  async update(@Param('id') id: number, @Body() updateQuestionnaireDto: UpdateQuestionnaireDto): Promise<Questionnaire> {
    return this.questionnaireService.update(id, updateQuestionnaireDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a questionnaire by ID' })
  @ApiResponse({ status: 200, description: 'Questionnaire successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Questionnaire not found.' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.questionnaireService.remove(id);
  }
}

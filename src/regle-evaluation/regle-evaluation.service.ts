import { Injectable } from '@nestjs/common';
import { CreateRegleEvaluationDto } from './dto/create-regle-evaluation.dto';
import { UpdateRegleEvaluationDto } from './dto/update-regle-evaluation.dto';

@Injectable()
export class RegleEvaluationService {
  create(createRegleEvaluationDto: CreateRegleEvaluationDto) {
    return 'This action adds a new regleEvaluation';
  }

  findAll() {
    return `This action returns all regleEvaluation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} regleEvaluation`;
  }

  update(id: number, updateRegleEvaluationDto: UpdateRegleEvaluationDto) {
    return `This action updates a #${id} regleEvaluation`;
  }

  remove(id: number) {
    return `This action removes a #${id} regleEvaluation`;
  }
}

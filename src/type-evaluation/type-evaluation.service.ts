import { Injectable } from '@nestjs/common';
import { CreateTypeEvaluationDto } from './dto/create-type-evaluation.dto';
import { UpdateTypeEvaluationDto } from './dto/update-type-evaluation.dto';

@Injectable()
export class TypeEvaluationService {
  create(createTypeEvaluationDto: CreateTypeEvaluationDto) {
    return 'This action adds a new typeEvaluation';
  }

  findAll() {
    return `This action returns all typeEvaluation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} typeEvaluation`;
  }

  update(id: number, updateTypeEvaluationDto: UpdateTypeEvaluationDto) {
    return `This action updates a #${id} typeEvaluation`;
  }

  remove(id: number) {
    return `This action removes a #${id} typeEvaluation`;
  }
}

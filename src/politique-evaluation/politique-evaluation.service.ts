import { Injectable } from '@nestjs/common';
import { CreatePolitiqueEvaluationDto } from './dto/create-politique-evaluation.dto';
import { UpdatePolitiqueEvaluationDto } from './dto/update-politique-evaluation.dto';

@Injectable()
export class PolitiqueEvaluationService {
  create(createPolitiqueEvaluationDto: CreatePolitiqueEvaluationDto) {
    return 'This action adds a new politiqueEvaluation';
  }

  findAll() {
    return `This action returns all politiqueEvaluation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} politiqueEvaluation`;
  }

  update(id: number, updatePolitiqueEvaluationDto: UpdatePolitiqueEvaluationDto) {
    return `This action updates a #${id} politiqueEvaluation`;
  }

  remove(id: number) {
    return `This action removes a #${id} politiqueEvaluation`;
  }
}

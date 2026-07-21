import { Injectable } from '@nestjs/common';
import { CreateDecisionFinAnneeDto } from './dto/create-decision-fin-annee.dto';
import { UpdateDecisionFinAnneeDto } from './dto/update-decision-fin-annee.dto';

@Injectable()
export class DecisionFinAnneeService {
  create(createDecisionFinAnneeDto: CreateDecisionFinAnneeDto) {
    return 'This action adds a new decisionFinAnnee';
  }

  findAll() {
    return `This action returns all decisionFinAnnee`;
  }

  findOne(id: number) {
    return `This action returns a #${id} decisionFinAnnee`;
  }

  update(id: number, updateDecisionFinAnneeDto: UpdateDecisionFinAnneeDto) {
    return `This action updates a #${id} decisionFinAnnee`;
  }

  remove(id: number) {
    return `This action removes a #${id} decisionFinAnnee`;
  }
}

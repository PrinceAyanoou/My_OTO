import { Test, TestingModule } from '@nestjs/testing';
import { EmployeDocumentController } from './employe-document.controller';
import { EmployeDocumentService } from './employe-document.service';

describe('EmployeDocumentController', () => {
  let controller: EmployeDocumentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeDocumentController],
      providers: [EmployeDocumentService],
    }).compile();

    controller = module.get<EmployeDocumentController>(EmployeDocumentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

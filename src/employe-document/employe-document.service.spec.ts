import { Test, TestingModule } from '@nestjs/testing';
import { EmployeDocumentService } from './employe-document.service';

describe('EmployeDocumentService', () => {
  let service: EmployeDocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeDocumentService],
    }).compile();

    service = module.get<EmployeDocumentService>(EmployeDocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

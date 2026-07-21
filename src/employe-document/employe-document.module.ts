import { Module } from '@nestjs/common';
import { EmployeDocumentService } from './employe-document.service';
import { EmployeDocumentController } from './employe-document.controller';

@Module({
  controllers: [EmployeDocumentController],
  providers: [EmployeDocumentService],
})
export class EmployeDocumentModule {}

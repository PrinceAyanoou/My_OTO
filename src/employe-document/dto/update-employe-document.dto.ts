import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeDocumentDto } from './create-employe-document.dto';

export class UpdateEmployeDocumentDto extends PartialType(CreateEmployeDocumentDto) {}

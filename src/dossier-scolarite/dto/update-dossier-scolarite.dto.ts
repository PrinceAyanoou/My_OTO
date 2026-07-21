import { PartialType } from '@nestjs/mapped-types';
import { CreateDossierScolariteDto } from './create-dossier-scolarite.dto';

export class UpdateDossierScolariteDto extends PartialType(CreateDossierScolariteDto) {}

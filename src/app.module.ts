import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { YModule } from './y/y.module';
import { AbsencesModule } from './absences/absences.module';
import { UserModule } from './user/user.module';
import { UniteEnseignementModule } from './unite-enseignement/unite-enseignement.module';
import { TypeEvaluationModule } from './type-evaluation/type-evaluation.module';
import { TrancheScolariteModule } from './tranche-scolarite/tranche-scolarite.module';
import { RolePermissionModule } from './role-permission/role-permission.module';
import { RoleModule } from './role/role.module';
import { RegleEvaluationModule } from './regle-evaluation/regle-evaluation.module';
import { PolitiqueEvaluationModule } from './politique-evaluation/politique-evaluation.module';
import { PermissionModule } from './permission/permission.module';
import { PeriodeScolaireModule } from './periode-scolaire/periode-scolaire.module';
import { ParticipantConversationModule } from './participant-conversation/participant-conversation.module';
import { ParentModule } from './parent/parent.module';
import { PaiementModule } from './paiement/paiement.module';
import { NoteModule } from './note/note.module';
import { NiveauScolaireModule } from './niveau-scolaire/niveau-scolaire.module';
import { MessageModule } from './message/message.module';
import { MatiereUeModule } from './matiere-ue/matiere-ue.module';
import { MatiereModule } from './matiere/matiere.module';
import { LigneBulletinModule } from './ligne-bulletin/ligne-bulletin.module';
import { InscriptionModule } from './inscription/inscription.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { EmployeRoleModule } from './employe-role/employe-role.module';
import { EmployeDocumentModule } from './employe-document/employe-document.module';
import { EmployeModule } from './employe/employe.module';
import { EmploiDuTempsModule } from './emploi-du-temps/emploi-du-temps.module';
import { EcoleModule } from './ecole/ecole.module';
import { DossierScolariteModule } from './dossier-scolarite/dossier-scolarite.module';
import { DecisionFinAnneeModule } from './decision-fin-annee/decision-fin-annee.module';
import { ConversationModule } from './conversation/conversation.module';
import { ConversationModule } from './conversation/conversation.module';
import { ConfigurationScolariteModule } from './configuration-scolarite/configuration-scolarite.module';
import { ClasseScolaireModule } from './classe-scolaire/classe-scolaire.module';
import { ClasseMatirereModule } from './classe-matirere/classe-matirere.module';
import { CibleAnnonceModule } from './cible-annonce/cible-annonce.module';
import { BulletinModule } from './bulletin/bulletin.module';
import { ApprenantParentModule } from './apprenant-parent/apprenant-parent.module';
import { ApprenantModule } from './apprenant/apprenant.module';
import { AnnonceModule } from './annonce/annonce.module';
import { AnneeScolaireModule } from './annee-scolaire/annee-scolaire.module';
import { AffectationEnseignantModule } from './affectation-enseignant/affectation-enseignant.module';
import { AbsencesModule } from './absences/absences.module';
import { AbsencesModule } from './absences/absences.module';

@Module({
  imports: [YModule, AbsencesModule, AffectationEnseignantModule, AnneeScolaireModule, AnnonceModule, ApprenantModule, ApprenantParentModule, BulletinModule, CibleAnnonceModule, ClasseMatirereModule, ClasseScolaireModule, ConfigurationScolariteModule, ConversationModule, DecisionFinAnneeModule, DossierScolariteModule, EcoleModule, EmploiDuTempsModule, EmployeModule, EmployeDocumentModule, EmployeRoleModule, EvaluationModule, InscriptionModule, LigneBulletinModule, MatiereModule, MatiereUeModule, MessageModule, NiveauScolaireModule, NoteModule, PaiementModule, ParentModule, ParticipantConversationModule, PeriodeScolaireModule, PermissionModule, PolitiqueEvaluationModule, RegleEvaluationModule, RoleModule, RolePermissionModule, TrancheScolariteModule, TypeEvaluationModule, UniteEnseignementModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

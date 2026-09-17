import { Test, TestingModule } from '@nestjs/testing';
import { InscriptionController } from './inscription.controller';
import { InscriptionService } from './inscription.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';

describe('InscriptionController', () => {
  let controller: InscriptionController;

  const inscriptionServiceMock = {
    findAllBySchool: jest.fn(),
    findOne: jest.fn(),
    findHistoryByApprenant: jest.fn(),
    changeClasse: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InscriptionController],
      providers: [
        {
          provide: InscriptionService,
          useValue: inscriptionServiceMock,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<InscriptionController>(InscriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue la recherche des inscriptions de l’école', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const anneeScolaireId = '22222222-2222-4222-8222-222222222222';
    const classeScolaireId = '33333333-3333-4333-8333-333333333333';
    const response = [{ apprenantId: 'apprenant-1' }];
    inscriptionServiceMock.findAllBySchool.mockResolvedValue(response);

    await expect(
      controller.findAllBySchool(ecoleId, anneeScolaireId, classeScolaireId),
    ).resolves.toBe(response);
    expect(inscriptionServiceMock.findAllBySchool).toHaveBeenCalledWith(
      ecoleId,
      anneeScolaireId,
      classeScolaireId,
    );
  });

  it('délègue la recherche d’une inscription', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const apprenantId = '22222222-2222-4222-8222-222222222222';
    const anneeScolaireId = '33333333-3333-4333-8333-333333333333';
    const response = { apprenantId, anneeScolaireId };
    inscriptionServiceMock.findOne.mockResolvedValue(response);

    await expect(
      controller.findOne(ecoleId, apprenantId, anneeScolaireId),
    ).resolves.toBe(response);
    expect(inscriptionServiceMock.findOne).toHaveBeenCalledWith(
      apprenantId,
      anneeScolaireId,
      ecoleId,
    );
  });

  it('délègue l’historique d’un apprenant', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const apprenantId = '22222222-2222-4222-8222-222222222222';
    const response = [{ apprenantId }];
    inscriptionServiceMock.findHistoryByApprenant.mockResolvedValue(response);

    await expect(
      controller.findHistoryByApprenant(ecoleId, apprenantId),
    ).resolves.toBe(response);
    expect(inscriptionServiceMock.findHistoryByApprenant).toHaveBeenCalledWith(
      apprenantId,
      ecoleId,
    );
  });

  it('délègue le changement de classe', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const apprenantId = '22222222-2222-4222-8222-222222222222';
    const anneeScolaireId = '33333333-3333-4333-8333-333333333333';
    const dto = {
      nouvelleClasseId: '44444444-4444-4444-8444-444444444444',
      motif: 'Changement demandé',
    };
    const response = { classeScolaireId: dto.nouvelleClasseId };
    inscriptionServiceMock.changeClasse.mockResolvedValue(response);

    await expect(
      controller.changeClasse(ecoleId, apprenantId, anneeScolaireId, dto),
    ).resolves.toBe(response);
    expect(inscriptionServiceMock.changeClasse).toHaveBeenCalledWith(
      apprenantId,
      anneeScolaireId,
      dto,
      ecoleId,
    );
  });

  it('délègue la mise à jour d’une inscription', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const apprenantId = '22222222-2222-4222-8222-222222222222';
    const anneeScolaireId = '33333333-3333-4333-8333-333333333333';
    const dto = { matricule: 'INS-001' };
    const response = { matricule: dto.matricule };
    inscriptionServiceMock.update.mockResolvedValue(response);

    await expect(
      controller.update(ecoleId, apprenantId, anneeScolaireId, dto),
    ).resolves.toBe(response);
    expect(inscriptionServiceMock.update).toHaveBeenCalledWith(
      apprenantId,
      anneeScolaireId,
      dto,
      ecoleId,
    );
  });

  it('délègue la suppression d’une inscription', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const apprenantId = '22222222-2222-4222-8222-222222222222';
    const anneeScolaireId = '33333333-3333-4333-8333-333333333333';
    const response = { apprenantId, anneeScolaireId };
    inscriptionServiceMock.remove.mockResolvedValue(response);

    await expect(
      controller.remove(ecoleId, apprenantId, anneeScolaireId),
    ).resolves.toBe(response);
    expect(inscriptionServiceMock.remove).toHaveBeenCalledWith(
      apprenantId,
      anneeScolaireId,
      ecoleId,
    );
  });
});

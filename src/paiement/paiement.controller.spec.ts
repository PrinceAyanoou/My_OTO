import { Test, TestingModule } from '@nestjs/testing';
import { PaiementController } from './paiement.controller';
import { PaiementService } from './paiement.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';

describe('PaiementController', () => {
  let controller: PaiementController;

  const paiementServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaiementController],
      providers: [{ provide: PaiementService, useValue: paiementServiceMock }],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<PaiementController>(PaiementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue la création d’un paiement', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const dto = {
      montant: 500,
      datePaiement: '2026-09-17',
      moyenPaiement: 'ESPECES' as const,
      dossierScolariteId: '22222222-2222-4222-8222-222222222222',
    };
    const response = { id: 'paiement-1' };
    paiementServiceMock.create.mockResolvedValue(response);

    await expect(controller.create(ecoleId, dto)).resolves.toBe(response);
    expect(paiementServiceMock.create).toHaveBeenCalledWith(ecoleId, dto);
  });

  it('délègue la recherche des paiements', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const response = [{ id: 'paiement-1' }];
    paiementServiceMock.findAll.mockResolvedValue(response);

    await expect(controller.findAll(ecoleId)).resolves.toBe(response);
    expect(paiementServiceMock.findAll).toHaveBeenCalledWith(ecoleId);
  });

  it('délègue la recherche d’un paiement', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const paiementId = '22222222-2222-4222-8222-222222222222';
    const response = { id: paiementId };
    paiementServiceMock.findOne.mockResolvedValue(response);

    await expect(controller.findOne(ecoleId, paiementId)).resolves.toBe(
      response,
    );
    expect(paiementServiceMock.findOne).toHaveBeenCalledWith(
      ecoleId,
      paiementId,
    );
  });

  it('délègue la mise à jour d’un paiement', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const paiementId = '22222222-2222-4222-8222-222222222222';
    const dto = { montant: 600 };
    const response = { id: paiementId, ...dto };
    paiementServiceMock.update.mockResolvedValue(response);

    await expect(controller.update(ecoleId, paiementId, dto)).resolves.toBe(
      response,
    );
    expect(paiementServiceMock.update).toHaveBeenCalledWith(
      ecoleId,
      paiementId,
      dto,
    );
  });

  it('délègue la suppression d’un paiement', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const paiementId = '22222222-2222-4222-8222-222222222222';
    const response = { message: 'Le paiement a été supprimé avec succès.' };
    paiementServiceMock.remove.mockResolvedValue(response);

    await expect(controller.remove(ecoleId, paiementId)).resolves.toBe(
      response,
    );
    expect(paiementServiceMock.remove).toHaveBeenCalledWith(
      ecoleId,
      paiementId,
    );
  });
});

/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';
import { PoliciesGuard } from 'src/auth/guards/permissions.guard';
import { DemandeEcoleController } from './demande-ecole.controller';
import { DemandeEcoleService } from './demande-ecole.service';

describe('DemandeEcoleController', () => {
  let controller: DemandeEcoleController;

  const demandeEcoleServiceMock = {
    demanderCreation: jest.fn(),
    demanderModification: jest.fn(),
    demanderSuppression: jest.fn(),
    findDemandesByEcole: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DemandeEcoleController],
      providers: [
        {
          provide: DemandeEcoleService,
          useValue: demandeEcoleServiceMock,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<DemandeEcoleController>(DemandeEcoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue la demande de création', async () => {
    const dto = {
      nom: 'Nouvelle école',
      type: 'MATERNELLE_PRIMAIRE',
      nomFondateur: 'Jean Dupont',
      ville: 'Cotonou',
      boitePostale: 'BP 123',
      email: 'contact@example.com',
      telephone: '+22997000000',
      description: 'Description',
    };
    const user = { sub: 'clerk-user-1' };
    const response = { id: 'demande-1' };
    demandeEcoleServiceMock.demanderCreation.mockResolvedValue(response);

    await expect(
      controller.demanderCreation(user as any, dto as any),
    ).resolves.toBe(response);
    expect(demandeEcoleServiceMock.demanderCreation).toHaveBeenCalledWith(
      'clerk-user-1',
      dto,
    );
  });

  it('délègue la demande de modification', async () => {
    const dto = {
      motif: 'Changement',
      donnees: { nom: 'Nouveau nom' },
    };
    const user = { sub: 'clerk-user-1' };
    const response = { id: 'demande-2' };
    demandeEcoleServiceMock.demanderModification.mockResolvedValue(response);

    await expect(
      controller.demanderModification(
        '11111111-1111-4111-8111-111111111111',
        user as any,
        dto as any,
      ),
    ).resolves.toBe(response);
    expect(demandeEcoleServiceMock.demanderModification).toHaveBeenCalledWith(
      'clerk-user-1',
      { ...dto, ecoleId: '11111111-1111-4111-8111-111111111111' },
    );
  });

  it('délègue la demande de suppression', async () => {
    const dto = { motif: 'Suppression prévue' };
    const user = { sub: 'clerk-user-1' };
    const response = { id: 'demande-3' };
    demandeEcoleServiceMock.demanderSuppression.mockResolvedValue(response);

    await expect(
      controller.demanderSuppression(
        '11111111-1111-4111-8111-111111111111',
        user as any,
        dto as any,
      ),
    ).resolves.toBe(response);
    expect(demandeEcoleServiceMock.demanderSuppression).toHaveBeenCalledWith(
      'clerk-user-1',
      { ...dto, ecoleId: '11111111-1111-4111-8111-111111111111' },
    );
  });

  it('délègue la recherche des demandes par école', async () => {
    const user = { sub: 'clerk-user-1' };
    const response = [{ id: 'demande-4' }];
    demandeEcoleServiceMock.findDemandesByEcole.mockResolvedValue(response);

    await expect(
      controller.findDemandesByEcole(
        '11111111-1111-4111-8111-111111111111',
        user as any,
      ),
    ).resolves.toBe(response);
    expect(demandeEcoleServiceMock.findDemandesByEcole).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      'clerk-user-1',
    );
  });
});

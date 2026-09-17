import { Test, TestingModule } from '@nestjs/testing';
import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';
import { PoliciesGuard } from 'src/auth/guards/permissions.guard';
import { DossierScolariteController } from './dossier-scolarite.controller';
import { DossierScolariteService } from './dossier-scolarite.service';

describe('DossierScolariteController', () => {
  let controller: DossierScolariteController;

  const dossierScolariteServiceMock = {
    create: jest.fn(),
    findByAnnee: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DossierScolariteController],
      providers: [
        {
          provide: DossierScolariteService,
          useValue: dossierScolariteServiceMock,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<DossierScolariteController>(
      DossierScolariteController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue la création du dossier', async () => {
    const dto = {
      inscriptionApprenantId: '11111111-1111-4111-8111-111111111111',
      inscriptionAnneeId: '22222222-2222-4222-8222-222222222222',
      configurationScolariteId: '33333333-3333-4333-8333-333333333333',
      montant: 500,
      resteAPayer: 200,
      statut: 'A_JOUR',
    };
    const response = { id: 'dossier-1' };
    dossierScolariteServiceMock.create.mockResolvedValue(response);

    await expect(controller.create(dto as any)).resolves.toBe(response);
    expect(dossierScolariteServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('délègue la recherche par année', async () => {
    const response = [{ id: 'dossier-1' }];
    dossierScolariteServiceMock.findByAnnee.mockResolvedValue(response);

    await expect(
      controller.findByAnnee('22222222-2222-4222-8222-222222222222'),
    ).resolves.toBe(response);
    expect(dossierScolariteServiceMock.findByAnnee).toHaveBeenCalledWith(
      '22222222-2222-4222-8222-222222222222',
    );
  });

  it('délègue la recherche d’un dossier', async () => {
    const response = { id: 'dossier-1' };
    dossierScolariteServiceMock.findOne.mockResolvedValue(response);

    await expect(
      controller.findOne(
        '11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222',
      ),
    ).resolves.toBe(response);
    expect(dossierScolariteServiceMock.findOne).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
    );
  });

  it('délègue la mise à jour du dossier', async () => {
    const dto = { montant: 600, resteAPayer: 100 };
    const response = { id: 'dossier-1', ...dto };
    dossierScolariteServiceMock.update.mockResolvedValue(response);

    await expect(
      controller.update(
        '11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222',
        dto as any,
      ),
    ).resolves.toBe(response);
    expect(dossierScolariteServiceMock.update).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
      dto,
    );
  });
});

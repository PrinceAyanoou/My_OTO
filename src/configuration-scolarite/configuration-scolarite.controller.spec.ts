import { Test, TestingModule } from '@nestjs/testing';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';
import { ConfigurationScolariteController } from './configuration-scolarite.controller';
import { ConfigurationScolariteService } from './configuration-scolarite.service';

describe('ConfigurationScolariteController', () => {
  let controller: ConfigurationScolariteController;

  const serviceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const ecoleId = '550e8400-e29b-41d4-a716-446655440000';
  const configId = '660e8400-e29b-41d4-a716-446655440000';
  const niveauId = '770e8400-e29b-41d4-a716-446655440000';
  const anneeId = '880e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigurationScolariteController],
      providers: [
        {
          provide: ConfigurationScolariteService,
          useValue: serviceMock,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ConfigurationScolariteController>(
      ConfigurationScolariteController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue la création au service', async () => {
    const dto = {
      nom: 'Configuration 2026',
      niveauScolaireId: niveauId,
      anneeScolaireId: anneeId,
      estActive: true,
    };
    const result = { id: configId, ...dto };
    serviceMock.create.mockResolvedValue(result);

    await expect(controller.create(ecoleId, dto)).resolves.toBe(result);
    expect(serviceMock.create).toHaveBeenCalledWith(ecoleId, dto);
  });

  it('délègue la recherche filtrée et paginée', async () => {
    const query = {
      niveauScolaireId: niveauId,
      anneeScolaireId: anneeId,
      estActive: true,
      page: 1,
      limit: 10,
    };
    const result = { data: [], meta: { total: 0 } };
    serviceMock.findAll.mockResolvedValue(result);

    await expect(controller.findAll(ecoleId, query)).resolves.toBe(result);
    expect(serviceMock.findAll).toHaveBeenCalledWith(ecoleId, query);
  });

  it('délègue la recherche par identifiant', async () => {
    const result = { id: configId };
    serviceMock.findOne.mockResolvedValue(result);

    await expect(controller.findOne(ecoleId, configId)).resolves.toBe(result);
    expect(serviceMock.findOne).toHaveBeenCalledWith(ecoleId, configId);
  });

  it('délègue la mise à jour', async () => {
    const dto = { nom: 'Configuration modifiée' };
    const result = { id: configId, ...dto };
    serviceMock.update.mockResolvedValue(result);

    await expect(controller.update(ecoleId, configId, dto)).resolves.toBe(
      result,
    );
    expect(serviceMock.update).toHaveBeenCalledWith(ecoleId, configId, dto);
  });

  it('délègue la suppression', async () => {
    const result = { id: configId };
    serviceMock.remove.mockResolvedValue(result);

    await expect(controller.remove(ecoleId, configId)).resolves.toBe(result);
    expect(serviceMock.remove).toHaveBeenCalledWith(ecoleId, configId);
  });
});

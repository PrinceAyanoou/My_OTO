import { Test, TestingModule } from '@nestjs/testing';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';
import { ClasseScolaireController } from './classe-scolaire.controller';
import { ClasseScolaireService } from './classe-scolaire.service';

describe('ClasseScolaireController', () => {
  let controller: ClasseScolaireController;

  const serviceMock = {
    create: jest.fn(),
    findAllByNiveau: jest.fn(),
    findAllByEcole: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const niveauId = '550e8400-e29b-41d4-a716-446655440000';
  const classeId = '660e8400-e29b-41d4-a716-446655440000';
  const ecoleId = '770e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClasseScolaireController],
      providers: [{ provide: ClasseScolaireService, useValue: serviceMock }],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ClasseScolaireController>(ClasseScolaireController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue la création au service', async () => {
    const dto = { nom: '6e A', capacite: 40 };
    const result = { id: classeId, ...dto };
    serviceMock.create.mockResolvedValue(result);

    await expect(controller.create(niveauId, dto)).resolves.toBe(result);
    expect(serviceMock.create).toHaveBeenCalledWith(niveauId, dto);
  });

  it('délègue la recherche par niveau', async () => {
    const query = { search: '6e' };
    const result = { data: [], meta: { total: 0 } };
    serviceMock.findAllByNiveau.mockResolvedValue(result);

    await expect(controller.findAllByNiveau(niveauId, query)).resolves.toBe(
      result,
    );
    expect(serviceMock.findAllByNiveau).toHaveBeenCalledWith(niveauId, query);
  });

  it('délègue la recherche par école', async () => {
    const query = { search: 'Terminale' };
    const result = { data: [], meta: { total: 0 } };
    serviceMock.findAllByEcole.mockResolvedValue(result);

    await expect(controller.findAllByEcole(ecoleId, query)).resolves.toBe(
      result,
    );
    expect(serviceMock.findAllByEcole).toHaveBeenCalledWith(ecoleId, query);
  });

  it('délègue la recherche d’une classe', async () => {
    const result = { id: classeId, nom: '6e A' };
    serviceMock.findOne.mockResolvedValue(result);

    await expect(controller.findOne(niveauId, classeId)).resolves.toBe(result);
    expect(serviceMock.findOne).toHaveBeenCalledWith(niveauId, classeId);
  });

  it('délègue la mise à jour', async () => {
    const dto = { nom: '6e B', capacite: 45 };
    const result = { id: classeId, ...dto };
    serviceMock.update.mockResolvedValue(result);

    await expect(controller.update(niveauId, classeId, dto)).resolves.toBe(
      result,
    );
    expect(serviceMock.update).toHaveBeenCalledWith(niveauId, classeId, dto);
  });

  it('délègue la suppression', async () => {
    const result = { id: classeId };
    serviceMock.remove.mockResolvedValue(result);

    await expect(controller.remove(niveauId, classeId)).resolves.toBe(result);
    expect(serviceMock.remove).toHaveBeenCalledWith(niveauId, classeId);
  });
});

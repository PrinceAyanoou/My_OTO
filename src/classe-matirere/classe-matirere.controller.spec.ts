import { Test, TestingModule } from '@nestjs/testing';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';
import { ClasseMatiereController } from './classe-matirere.controller';
import { ClasseMatiereService } from './classe-matirere.service';

describe('ClasseMatiereController', () => {
  let controller: ClasseMatiereController;

  const serviceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const ecoleId = '550e8400-e29b-41d4-a716-446655440000';
  const relationId = '660e8400-e29b-41d4-a716-446655440000';
  const classeId = '770e8400-e29b-41d4-a716-446655440000';
  const matiereId = '880e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClasseMatiereController],
      providers: [{ provide: ClasseMatiereService, useValue: serviceMock }],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ClasseMatiereController>(ClasseMatiereController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue la création au service', async () => {
    const dto = { classeScolaireId: classeId, matiereId, coefficient: 2 };
    const result = { id: relationId, ...dto };
    serviceMock.create.mockResolvedValue(result);

    await expect(controller.create(ecoleId, dto)).resolves.toBe(result);
    expect(serviceMock.create).toHaveBeenCalledWith(ecoleId, dto);
  });

  it('délègue la recherche paginée au service', async () => {
    const query = { page: 2, limit: 10, matiereId };
    const result = { data: [], meta: { total: 0, page: 2, limit: 10 } };
    serviceMock.findAll.mockResolvedValue(result);

    await expect(controller.findAll(ecoleId, query)).resolves.toBe(result);
    expect(serviceMock.findAll).toHaveBeenCalledWith(ecoleId, query);
  });

  it('délègue la recherche par identifiant', async () => {
    const result = { id: relationId };
    serviceMock.findOne.mockResolvedValue(result);

    await expect(controller.findOne(ecoleId, relationId)).resolves.toBe(result);
    expect(serviceMock.findOne).toHaveBeenCalledWith(ecoleId, relationId);
  });

  it('délègue la mise à jour', async () => {
    const dto = { coefficient: 3 };
    const result = { id: relationId, ...dto };
    serviceMock.update.mockResolvedValue(result);

    await expect(controller.update(ecoleId, relationId, dto)).resolves.toBe(
      result,
    );
    expect(serviceMock.update).toHaveBeenCalledWith(ecoleId, relationId, dto);
  });

  it('délègue la suppression', async () => {
    const result = { id: relationId };
    serviceMock.remove.mockResolvedValue(result);

    await expect(controller.remove(ecoleId, relationId)).resolves.toBe(result);
    expect(serviceMock.remove).toHaveBeenCalledWith(ecoleId, relationId);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { MatiereController } from './matiere.controller';
import { MatiereService } from './matiere.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';

describe('MatiereController', () => {
  let controller: MatiereController;

  const matiereServiceMock = {
    create: jest.fn(),
    findAllByEcole: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatiereController],
      providers: [
        {
          provide: MatiereService,
          useValue: matiereServiceMock,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<MatiereController>(MatiereController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue la création d’une matière', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const dto = {
      nom: 'Mathématiques',
      CodeMat: 'MATH',
      description: 'Cours de mathématiques',
    };
    const response = { id: 'matiere-1', ...dto };
    matiereServiceMock.create.mockResolvedValue(response);

    await expect(controller.create(ecoleId, dto)).resolves.toBe(response);
    expect(matiereServiceMock.create).toHaveBeenCalledWith(ecoleId, dto);
  });

  it('délègue la recherche des matières', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const query = { search: 'math' };
    const response = [{ id: 'matiere-1' }];
    matiereServiceMock.findAllByEcole.mockResolvedValue(response);

    await expect(controller.findAllByEcole(ecoleId, query)).resolves.toBe(
      response,
    );
    expect(matiereServiceMock.findAllByEcole).toHaveBeenCalledWith(
      ecoleId,
      query,
    );
  });

  it('délègue la recherche d’une matière', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const matiereId = '22222222-2222-4222-8222-222222222222';
    const response = { id: matiereId, nom: 'Mathématiques' };
    matiereServiceMock.findOne.mockResolvedValue(response);

    await expect(controller.findOne(ecoleId, matiereId)).resolves.toBe(
      response,
    );
    expect(matiereServiceMock.findOne).toHaveBeenCalledWith(ecoleId, matiereId);
  });

  it('délègue la mise à jour d’une matière', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const matiereId = '22222222-2222-4222-8222-222222222222';
    const dto = { nom: 'Algèbre' };
    const response = { id: matiereId, ...dto };
    matiereServiceMock.update.mockResolvedValue(response);

    await expect(controller.update(ecoleId, matiereId, dto)).resolves.toBe(
      response,
    );
    expect(matiereServiceMock.update).toHaveBeenCalledWith(
      ecoleId,
      matiereId,
      dto,
    );
  });

  it('délègue la suppression d’une matière', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const matiereId = '22222222-2222-4222-8222-222222222222';
    const response = { id: matiereId };
    matiereServiceMock.remove.mockResolvedValue(response);

    await expect(controller.remove(ecoleId, matiereId)).resolves.toBe(response);
    expect(matiereServiceMock.remove).toHaveBeenCalledWith(ecoleId, matiereId);
  });
});

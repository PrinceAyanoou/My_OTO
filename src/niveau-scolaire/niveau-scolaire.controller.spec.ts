import { Test, TestingModule } from '@nestjs/testing';
import { NiveauScolaireController } from './niveau-scolaire.controller';
import { NiveauScolaireService } from './niveau-scolaire.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';

describe('NiveauScolaireController', () => {
  let controller: NiveauScolaireController;

  const niveauScolaireServiceMock = {
    create: jest.fn(),
    findAllByEcole: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NiveauScolaireController],
      providers: [
        {
          provide: NiveauScolaireService,
          useValue: niveauScolaireServiceMock,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<NiveauScolaireController>(NiveauScolaireController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue la création d’un niveau', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const dto = { nom: 'Sixième' };
    const response = { id: 'niveau-1', ...dto };
    niveauScolaireServiceMock.create.mockResolvedValue(response);

    await expect(controller.create(ecoleId, dto)).resolves.toBe(response);
    expect(niveauScolaireServiceMock.create).toHaveBeenCalledWith(ecoleId, dto);
  });

  it('délègue la recherche des niveaux', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const query = { search: 'six' };
    const response = [{ id: 'niveau-1' }];
    niveauScolaireServiceMock.findAllByEcole.mockResolvedValue(response);

    await expect(controller.findAllByEcole(ecoleId, query)).resolves.toBe(
      response,
    );
    expect(niveauScolaireServiceMock.findAllByEcole).toHaveBeenCalledWith(
      ecoleId,
      query,
    );
  });

  it('délègue la recherche d’un niveau', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const niveauId = '22222222-2222-4222-8222-222222222222';
    const response = { id: niveauId, nom: 'Sixième' };
    niveauScolaireServiceMock.findOne.mockResolvedValue(response);

    await expect(controller.findOne(ecoleId, niveauId)).resolves.toBe(response);
    expect(niveauScolaireServiceMock.findOne).toHaveBeenCalledWith(
      ecoleId,
      niveauId,
    );
  });

  it('délègue la mise à jour d’un niveau', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const niveauId = '22222222-2222-4222-8222-222222222222';
    const dto = { nom: 'Cinquième' };
    const response = { id: niveauId, ...dto };
    niveauScolaireServiceMock.update.mockResolvedValue(response);

    await expect(controller.update(ecoleId, niveauId, dto)).resolves.toBe(
      response,
    );
    expect(niveauScolaireServiceMock.update).toHaveBeenCalledWith(
      ecoleId,
      niveauId,
      dto,
    );
  });

  it('délègue la suppression d’un niveau', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const niveauId = '22222222-2222-4222-8222-222222222222';
    const response = { id: niveauId };
    niveauScolaireServiceMock.remove.mockResolvedValue(response);

    await expect(controller.remove(ecoleId, niveauId)).resolves.toBe(response);
    expect(niveauScolaireServiceMock.remove).toHaveBeenCalledWith(
      ecoleId,
      niveauId,
    );
  });
});

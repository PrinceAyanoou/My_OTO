import { Test, TestingModule } from '@nestjs/testing';
import { EmploiDuTempsController } from './emploi-du-temps.controller';
import { EmploiDuTempsService } from './emploi-du-temps.service';
import {
  CreateEmploiDuTempsDto,
  QueryEmploiDuTempsDto,
  UpdateEmploiDuTempsDto,
} from './dto/emploi-du-temp.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';

describe('EmploiDuTempsController', () => {
  let controller: EmploiDuTempsController;

  const emploiDuTempsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmploiDuTempsController],
      providers: [
        {
          provide: EmploiDuTempsService,
          useValue: emploiDuTempsServiceMock,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<EmploiDuTempsController>(EmploiDuTempsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue la création du créneau', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const dto = {
      affectationEnseignantId: '22222222-2222-4222-8222-222222222222',
      jourDeLaSemaine: 'LUNDI',
      heureDebut: '08:00',
      heureFin: '10:00',
      classeScolaireId: '33333333-3333-4333-8333-333333333333',
    };
    const response = { id: 'emploi-1' };
    emploiDuTempsServiceMock.create.mockResolvedValue(response);

    await expect(
      controller.create(ecoleId, dto as CreateEmploiDuTempsDto),
    ).resolves.toBe(response);
    expect(emploiDuTempsServiceMock.create).toHaveBeenCalledWith(ecoleId, dto);
  });

  it('délègue la recherche des créneaux', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const query = {
      classeScolaireId: '33333333-3333-4333-8333-333333333333',
      jourDeLaSemaine: 'LUNDI',
    };
    const response = [{ id: 'emploi-1' }];
    emploiDuTempsServiceMock.findAll.mockResolvedValue(response);

    await expect(
      controller.findAll(ecoleId, query as QueryEmploiDuTempsDto),
    ).resolves.toBe(response);
    expect(emploiDuTempsServiceMock.findAll).toHaveBeenCalledWith(
      ecoleId,
      query,
    );
  });

  it('délègue la recherche d’un créneau', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const emploiId = '44444444-4444-4444-8444-444444444444';
    const response = { id: emploiId };
    emploiDuTempsServiceMock.findOne.mockResolvedValue(response);

    await expect(controller.findOne(ecoleId, emploiId)).resolves.toBe(response);
    expect(emploiDuTempsServiceMock.findOne).toHaveBeenCalledWith(
      ecoleId,
      emploiId,
    );
  });

  it('délègue la mise à jour du créneau', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const emploiId = '44444444-4444-4444-8444-444444444444';
    const dto = { heureFin: '11:00' };
    const response = { id: emploiId, ...dto };
    emploiDuTempsServiceMock.update.mockResolvedValue(response);

    await expect(
      controller.update(ecoleId, emploiId, dto as UpdateEmploiDuTempsDto),
    ).resolves.toBe(response);
    expect(emploiDuTempsServiceMock.update).toHaveBeenCalledWith(
      ecoleId,
      emploiId,
      dto,
    );
  });

  it('délègue la suppression du créneau', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const emploiId = '44444444-4444-4444-8444-444444444444';
    const response = { message: 'Créneau supprimé avec succès.' };
    emploiDuTempsServiceMock.remove.mockResolvedValue(response);

    await expect(controller.remove(ecoleId, emploiId)).resolves.toBe(response);
    expect(emploiDuTempsServiceMock.remove).toHaveBeenCalledWith(
      ecoleId,
      emploiId,
    );
  });
});

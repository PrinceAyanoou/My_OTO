import { Test, TestingModule } from '@nestjs/testing';
import { LigneBulletinController } from './ligne-bulletin.controller';
import { LigneBulletinService } from './ligne-bulletin.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';

describe('LigneBulletinController', () => {
  let controller: LigneBulletinController;

  const ligneBulletinServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByBulletin: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LigneBulletinController],
      providers: [
        {
          provide: LigneBulletinService,
          useValue: ligneBulletinServiceMock,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<LigneBulletinController>(LigneBulletinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue la création d’une ligne', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const dto = {
      bulletinApprenantId: '22222222-2222-4222-8222-222222222222',
      bulletinAnneeId: '33333333-3333-4333-8333-333333333333',
      bulletinId: '44444444-4444-4444-8444-444444444444',
      matiereId: '55555555-5555-4555-8555-555555555555',
      moyenne: 15,
    };
    const response = { id: 'ligne-1' };
    ligneBulletinServiceMock.create.mockResolvedValue(response);

    await expect(controller.create(ecoleId, dto)).resolves.toBe(response);
    expect(ligneBulletinServiceMock.create).toHaveBeenCalledWith(dto, ecoleId);
  });

  it('délègue la recherche de toutes les lignes', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const response = [{ id: 'ligne-1' }];
    ligneBulletinServiceMock.findAll.mockResolvedValue(response);

    await expect(controller.findAll(ecoleId)).resolves.toBe(response);
    expect(ligneBulletinServiceMock.findAll).toHaveBeenCalledWith(ecoleId);
  });

  it('délègue la recherche des lignes d’un bulletin', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const bulletinApprenantId = '22222222-2222-4222-8222-222222222222';
    const bulletinAnneeId = '33333333-3333-4333-8333-333333333333';
    const bulletinId = '44444444-4444-4444-8444-444444444444';
    const response = [{ id: 'ligne-1' }];
    ligneBulletinServiceMock.findByBulletin.mockResolvedValue(response);

    await expect(
      controller.findByBulletin(
        ecoleId,
        bulletinApprenantId,
        bulletinAnneeId,
        bulletinId,
      ),
    ).resolves.toBe(response);
    expect(ligneBulletinServiceMock.findByBulletin).toHaveBeenCalledWith(
      bulletinApprenantId,
      bulletinAnneeId,
      bulletinId,
      ecoleId,
    );
  });

  it('délègue la recherche d’une ligne', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const bulletinApprenantId = '22222222-2222-4222-8222-222222222222';
    const bulletinAnneeId = '33333333-3333-4333-8333-333333333333';
    const bulletinId = '44444444-4444-4444-8444-444444444444';
    const matiereId = '55555555-5555-4555-8555-555555555555';
    const response = { id: 'ligne-1' };
    ligneBulletinServiceMock.findOne.mockResolvedValue(response);

    await expect(
      controller.findOne(
        ecoleId,
        bulletinApprenantId,
        bulletinAnneeId,
        bulletinId,
        matiereId,
      ),
    ).resolves.toBe(response);
    expect(ligneBulletinServiceMock.findOne).toHaveBeenCalledWith(
      bulletinApprenantId,
      bulletinAnneeId,
      bulletinId,
      matiereId,
      ecoleId,
    );
  });

  it('délègue la mise à jour d’une ligne', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const bulletinApprenantId = '22222222-2222-4222-8222-222222222222';
    const bulletinAnneeId = '33333333-3333-4333-8333-333333333333';
    const bulletinId = '44444444-4444-4444-8444-444444444444';
    const matiereId = '55555555-5555-4555-8555-555555555555';
    const dto = { moyenne: 17 };
    const response = { id: 'ligne-1', ...dto };
    ligneBulletinServiceMock.update.mockResolvedValue(response);

    await expect(
      controller.update(
        ecoleId,
        bulletinApprenantId,
        bulletinAnneeId,
        bulletinId,
        matiereId,
        dto,
      ),
    ).resolves.toBe(response);
    expect(ligneBulletinServiceMock.update).toHaveBeenCalledWith(
      bulletinApprenantId,
      bulletinAnneeId,
      bulletinId,
      matiereId,
      dto,
      ecoleId,
    );
  });

  it('délègue la suppression d’une ligne', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const bulletinApprenantId = '22222222-2222-4222-8222-222222222222';
    const bulletinAnneeId = '33333333-3333-4333-8333-333333333333';
    const bulletinId = '44444444-4444-4444-8444-444444444444';
    const matiereId = '55555555-5555-4555-8555-555555555555';
    const response = { message: 'La ligne a été supprimée.' };
    ligneBulletinServiceMock.remove.mockResolvedValue(response);

    await expect(
      controller.remove(
        ecoleId,
        bulletinApprenantId,
        bulletinAnneeId,
        bulletinId,
        matiereId,
      ),
    ).resolves.toBe(response);
    expect(ligneBulletinServiceMock.remove).toHaveBeenCalledWith(
      bulletinApprenantId,
      bulletinAnneeId,
      bulletinId,
      matiereId,
      ecoleId,
    );
  });
});

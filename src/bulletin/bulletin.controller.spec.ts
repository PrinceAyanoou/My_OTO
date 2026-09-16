import { Test, TestingModule } from '@nestjs/testing';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';
import { BulletinController } from './bulletin.controller';
import { BulletinService } from './bulletin.service';

describe('BulletinController', () => {
  let controller: BulletinController;

  const bulletinServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    generatePdf: jest.fn(),
    generateBulletinsForClasse: jest.fn(),
    generateBulletinsForClasses: jest.fn(),
    generateBulletinsForSchool: jest.fn(),
  };

  const apprenantId = '550e8400-e29b-41d4-a716-446655440000';
  const anneeId = '660e8400-e29b-41d4-a716-446655440000';
  const periodeId = '770e8400-e29b-41d4-a716-446655440000';
  const classeId = '880e8400-e29b-41d4-a716-446655440000';
  const ecoleId = '990e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BulletinController],
      providers: [{ provide: BulletinService, useValue: bulletinServiceMock }],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<BulletinController>(BulletinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue la création au service', async () => {
    const dto = { inscriptionApprenantId: apprenantId };
    const result = { id: 'bulletin-1' };
    bulletinServiceMock.create.mockResolvedValue(result);

    await expect(controller.create(dto as never)).resolves.toBe(result);
    expect(bulletinServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('délègue la récupération de tous les bulletins', async () => {
    const result = [{ id: 'bulletin-1' }];
    bulletinServiceMock.findAll.mockResolvedValue(result);

    await expect(controller.findAll()).resolves.toBe(result);
    expect(bulletinServiceMock.findAll).toHaveBeenCalledWith();
  });

  it('délègue la récupération d’un bulletin avec sa clé composite', async () => {
    const result = { id: 'bulletin-1' };
    bulletinServiceMock.findOne.mockResolvedValue(result);

    await expect(
      controller.findOne(apprenantId, anneeId, periodeId),
    ).resolves.toBe(result);
    expect(bulletinServiceMock.findOne).toHaveBeenCalledWith(
      apprenantId,
      anneeId,
      periodeId,
    );
  });

  it('délègue la mise à jour du bulletin', async () => {
    const dto = { appreciation: 'Très bien' };
    const result = { id: 'bulletin-1', ...dto };
    bulletinServiceMock.update.mockResolvedValue(result);

    await expect(
      controller.update(apprenantId, anneeId, periodeId, dto),
    ).resolves.toBe(result);
    expect(bulletinServiceMock.update).toHaveBeenCalledWith(
      apprenantId,
      anneeId,
      periodeId,
      dto,
    );
  });

  it('délègue la suppression du bulletin', async () => {
    const result = { id: 'bulletin-1' };
    bulletinServiceMock.remove.mockResolvedValue(result);

    await expect(
      controller.remove(apprenantId, anneeId, periodeId),
    ).resolves.toBe(result);
    expect(bulletinServiceMock.remove).toHaveBeenCalledWith(
      apprenantId,
      anneeId,
      periodeId,
    );
  });

  it('délègue la génération PDF individuelle', async () => {
    const dto = {
      inscriptionApprenantId: apprenantId,
      inscriptionAnneeId: anneeId,
      periodeScolaireId: periodeId,
    };
    const result = { documentUrl: 'https://example.test/bulletin.pdf' };
    bulletinServiceMock.generatePdf.mockResolvedValue(result);

    await expect(controller.generatePdf(dto)).resolves.toBe(result);
    expect(bulletinServiceMock.generatePdf).toHaveBeenCalledWith(
      apprenantId,
      anneeId,
      periodeId,
    );
  });

  it('délègue la génération des bulletins d’une classe', async () => {
    const result = { total: 3, generes: 3, echecs: 0 };
    bulletinServiceMock.generateBulletinsForClasse.mockResolvedValue(result);

    await expect(
      controller.generateBulletinsForClasse(classeId, anneeId, periodeId),
    ).resolves.toBe(result);
    expect(bulletinServiceMock.generateBulletinsForClasse).toHaveBeenCalledWith(
      classeId,
      anneeId,
      periodeId,
    );
  });

  it('délègue la génération des bulletins de plusieurs classes', async () => {
    const classeIds = [classeId, 'aa0e8400-e29b-41d4-a716-446655440000'];
    const result = { totalClasses: 2, resultats: [] };
    bulletinServiceMock.generateBulletinsForClasses.mockResolvedValue(result);

    await expect(
      controller.generateBulletinsForClasses(anneeId, periodeId, classeIds),
    ).resolves.toBe(result);
    expect(
      bulletinServiceMock.generateBulletinsForClasses,
    ).toHaveBeenCalledWith(classeIds, anneeId, periodeId);
  });

  it('délègue la génération des bulletins de l’école', async () => {
    const result = { ecoleId, totalClasses: 1, resultats: [] };
    bulletinServiceMock.generateBulletinsForSchool.mockResolvedValue(result);

    await expect(
      controller.generateBulletinsForSchool(ecoleId, anneeId, periodeId),
    ).resolves.toBe(result);
    expect(bulletinServiceMock.generateBulletinsForSchool).toHaveBeenCalledWith(
      ecoleId,
      anneeId,
      periodeId,
    );
  });
});

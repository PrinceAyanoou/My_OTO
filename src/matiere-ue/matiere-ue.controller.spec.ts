import { Test, TestingModule } from '@nestjs/testing';
import { MatiereUeController } from './matiere-ue.controller';
import { MatiereUeService } from './matiere-ue.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';

describe('MatiereUeController', () => {
  let controller: MatiereUeController;

  const matiereUeServiceMock = {
    addMatiere: jest.fn(),
    findMatieresByUe: jest.fn(),
    updateMatiereCoefficient: jest.fn(),
    removeMatiere: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatiereUeController],
      providers: [
        {
          provide: MatiereUeService,
          useValue: matiereUeServiceMock,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<MatiereUeController>(MatiereUeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue l’ajout d’une matière à une UE', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const ueId = '22222222-2222-4222-8222-222222222222';
    const dto = {
      matiereId: '33333333-3333-4333-8333-333333333333',
      coefficient: 2,
    };
    const response = { id: 'relation-1' };
    matiereUeServiceMock.addMatiere.mockResolvedValue(response);

    await expect(controller.addMatiere(ecoleId, ueId, dto)).resolves.toBe(
      response,
    );
    expect(matiereUeServiceMock.addMatiere).toHaveBeenCalledWith(
      ecoleId,
      ueId,
      dto,
    );
  });

  it('délègue la liste des matières d’une UE', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const ueId = '22222222-2222-4222-8222-222222222222';
    const response = [{ id: 'relation-1' }];
    matiereUeServiceMock.findMatieresByUe.mockResolvedValue(response);

    await expect(controller.findMatieresByUe(ecoleId, ueId)).resolves.toBe(
      response,
    );
    expect(matiereUeServiceMock.findMatieresByUe).toHaveBeenCalledWith(
      ecoleId,
      ueId,
    );
  });

  it('délègue la modification du coefficient', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const ueId = '22222222-2222-4222-8222-222222222222';
    const matiereId = '33333333-3333-4333-8333-333333333333';
    const dto = { coefficient: 3 };
    const response = { id: 'relation-1', ...dto };
    matiereUeServiceMock.updateMatiereCoefficient.mockResolvedValue(response);

    await expect(
      controller.updateMatiereCoefficient(ecoleId, ueId, matiereId, dto),
    ).resolves.toBe(response);
    expect(matiereUeServiceMock.updateMatiereCoefficient).toHaveBeenCalledWith(
      ecoleId,
      ueId,
      matiereId,
      dto,
    );
  });

  it('délègue le retrait d’une matière de l’UE', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const ueId = '22222222-2222-4222-8222-222222222222';
    const matiereId = '33333333-3333-4333-8333-333333333333';
    const response = { id: 'relation-1' };
    matiereUeServiceMock.removeMatiere.mockResolvedValue(response);

    await expect(
      controller.removeMatiere(ecoleId, ueId, matiereId),
    ).resolves.toBe(response);
    expect(matiereUeServiceMock.removeMatiere).toHaveBeenCalledWith(
      ecoleId,
      ueId,
      matiereId,
    );
  });
});

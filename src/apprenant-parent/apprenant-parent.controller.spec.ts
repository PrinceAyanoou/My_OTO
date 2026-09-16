import { Test, TestingModule } from '@nestjs/testing';
import { ApprenantParentController } from './apprenant-parent.controller';
import { ApprenantParentService } from './apprenant-parent.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';

describe('ApprenantParentController', () => {
  let controller: ApprenantParentController;

  const apprenantParentServiceMock = {
    linkApprenant: jest.fn(),
    unlinkApprenant: jest.fn(),
  };

  const ecoleId = '550e8400-e29b-41d4-a716-446655440000';
  const parentId = '660e8400-e29b-41d4-a716-446655440000';
  const apprenantId = '770e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApprenantParentController],
      providers: [
        {
          provide: ApprenantParentService,
          useValue: apprenantParentServiceMock,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ApprenantParentController>(
      ApprenantParentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('devrait déléguer la création de la liaison au service', async () => {
      const dto = {
        apprenantId,
        lien: 'PERE' as const,
      };
      const serviceResult = {
        parentId,
        apprenantId,
        lien: 'PERE',
      };

      apprenantParentServiceMock.linkApprenant.mockResolvedValue(serviceResult);

      const result = await controller.create(ecoleId, parentId, dto);

      expect(apprenantParentServiceMock.linkApprenant).toHaveBeenCalledTimes(1);
      expect(apprenantParentServiceMock.linkApprenant).toHaveBeenCalledWith(
        parentId,
        dto,
        ecoleId,
      );
      expect(result).toBe(serviceResult);
    });

    it('devrait transmettre le lien de parenté reçu', async () => {
      const dto = {
        apprenantId,
        lien: 'TUTEUR' as const,
      };

      apprenantParentServiceMock.linkApprenant.mockResolvedValue(null);

      await controller.create(ecoleId, parentId, dto);

      expect(apprenantParentServiceMock.linkApprenant).toHaveBeenCalledWith(
        parentId,
        dto,
        ecoleId,
      );
    });
  });

  describe('remove', () => {
    it('devrait déléguer la suppression de la liaison au service', async () => {
      const serviceResult = {
        parentId,
        apprenantId,
        lien: 'MERE',
      };

      apprenantParentServiceMock.unlinkApprenant.mockResolvedValue(
        serviceResult,
      );

      const result = await controller.remove(ecoleId, parentId, apprenantId);

      expect(apprenantParentServiceMock.unlinkApprenant).toHaveBeenCalledTimes(
        1,
      );
      expect(apprenantParentServiceMock.unlinkApprenant).toHaveBeenCalledWith(
        parentId,
        apprenantId,
        ecoleId,
      );
      expect(result).toBe(serviceResult);
    });

    it('devrait retourner exactement le résultat du service', async () => {
      const serviceResult = { message: 'Liaison supprimée.' };

      apprenantParentServiceMock.unlinkApprenant.mockResolvedValue(
        serviceResult,
      );

      const result = await controller.remove(ecoleId, parentId, apprenantId);

      expect(result).toBe(serviceResult);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { PeriodeScolaireController } from './periode-scolaire.controller';
import { PeriodeScolaireService } from './periode-scolaire.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';

describe('PeriodeScolaireController', () => {
  let controller: PeriodeScolaireController;

  const periodeServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    changeStatut: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeriodeScolaireController],
      providers: [
        { provide: PeriodeScolaireService, useValue: periodeServiceMock },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<PeriodeScolaireController>(
      PeriodeScolaireController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue les opérations période scolaire', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const anneeId = '22222222-2222-4222-8222-222222222222';
    const periodeId = '33333333-3333-4333-8333-333333333333';
    const dto = { nom: 'P1' };
    const response = { id: periodeId };
    Object.values(periodeServiceMock).forEach((mock) =>
      mock.mockResolvedValue(response),
    );
    await expect(
      controller.create(ecoleId, anneeId, dto as never),
    ).resolves.toBe(response);
    await expect(
      controller.findAll(ecoleId, anneeId, dto as never),
    ).resolves.toBe(response);
    await expect(controller.findOne(ecoleId, anneeId, periodeId)).resolves.toBe(
      response,
    );
    await expect(
      controller.update(ecoleId, anneeId, periodeId, dto as never),
    ).resolves.toBe(response);
    await expect(
      controller.changeStatut(ecoleId, anneeId, periodeId, dto as never),
    ).resolves.toBe(response);
    await expect(controller.remove(ecoleId, anneeId, periodeId)).resolves.toBe(
      response,
    );
  });
});

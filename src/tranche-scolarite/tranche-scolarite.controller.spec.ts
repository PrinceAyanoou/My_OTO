import { Test, TestingModule } from '@nestjs/testing';
import { TrancheScolariteController } from './tranche-scolarite.controller';
import { TrancheScolariteService } from './tranche-scolarite.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';

describe('TrancheScolariteController', () => {
  let controller: TrancheScolariteController;

  const serviceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrancheScolariteController],
      providers: [{ provide: TrancheScolariteService, useValue: serviceMock }],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<TrancheScolariteController>(
      TrancheScolariteController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue les opérations tranche', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const configId = '22222222-2222-4222-8222-222222222222';
    const id = '33333333-3333-4333-8333-333333333333';
    const dto = { nom: 'T1' };
    const response = { id };
    Object.values(serviceMock).forEach((mock) =>
      mock.mockResolvedValue(response),
    );
    await expect(
      controller.create(ecoleId, configId, dto as never),
    ).resolves.toBe(response);
    await expect(controller.findAll(ecoleId, configId)).resolves.toBe(response);
    await expect(controller.findOne(ecoleId, configId, id)).resolves.toBe(
      response,
    );
    await expect(
      controller.update(ecoleId, configId, id, dto as never),
    ).resolves.toBe(response);
    await expect(controller.remove(ecoleId, configId, id)).resolves.toBe(
      response,
    );
  });
});

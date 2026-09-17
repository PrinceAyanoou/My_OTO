import { Test, TestingModule } from '@nestjs/testing';
import { RegleEvaluationController } from './regle-evaluation.controller';
import { RegleEvaluationService } from './regle-evaluation.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';

describe('RegleEvaluationController', () => {
  let controller: RegleEvaluationController;

  const serviceMock = {
    create: jest.fn(),
    findByPolitique: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegleEvaluationController],
      providers: [{ provide: RegleEvaluationService, useValue: serviceMock }],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<RegleEvaluationController>(
      RegleEvaluationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue les opérations règle', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const id = '22222222-2222-4222-8222-222222222222';
    const dto = { nombreMin: 1 };
    const response = { id };
    Object.values(serviceMock).forEach((mock) =>
      mock.mockResolvedValue(response),
    );
    await expect(controller.create(ecoleId, dto as never)).resolves.toBe(
      response,
    );
    await expect(controller.findByPolitique(ecoleId, id)).resolves.toBe(
      response,
    );
    await expect(controller.findOne(ecoleId, id)).resolves.toBe(response);
    await expect(controller.update(ecoleId, id, dto as never)).resolves.toBe(
      response,
    );
    await expect(controller.remove(ecoleId, id)).resolves.toBe(response);
  });
});

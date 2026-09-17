import { Test, TestingModule } from '@nestjs/testing';
import { TypeEvaluationController } from './type-evaluation.controller';
import { TypeEvaluationService } from './type-evaluation.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';

describe('TypeEvaluationController', () => {
  let controller: TypeEvaluationController;

  const serviceMock = { create: jest.fn(), findAllBySchool: jest.fn(), findOne: jest.fn(), update: jest.fn(), remove: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeEvaluationController],
      providers: [{ provide: TypeEvaluationService, useValue: serviceMock }],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<TypeEvaluationController>(TypeEvaluationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue les opérations type évaluation', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111'; const id = '22222222-2222-4222-8222-222222222222'; const dto = { nom: 'Devoir' }; const response = { id };
    Object.values(serviceMock).forEach((mock) => mock.mockResolvedValue(response));
    await expect(controller.create(ecoleId, dto as never)).resolves.toBe(response);
    await expect(controller.findAllBySchool(ecoleId)).resolves.toBe(response);
    await expect(controller.findOne(ecoleId, id)).resolves.toBe(response);
    await expect(controller.update(ecoleId, id, dto as never)).resolves.toBe(response);
    await expect(controller.remove(ecoleId, id)).resolves.toBe(response);
  });
});

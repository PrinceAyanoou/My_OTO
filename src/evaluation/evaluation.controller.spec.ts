import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationController } from './evaluation.controller';
import { EvaluationService } from './evaluation.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';

describe('EvaluationController', () => {
  let controller: EvaluationController;

  const evaluationServiceMock = {
    create: jest.fn(),
    findAllBySchool: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluationController],
      providers: [
        {
          provide: EvaluationService,
          useValue: evaluationServiceMock,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<EvaluationController>(EvaluationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue la création d’une évaluation', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const dto = {
      titre: 'Devoir de mathématiques',
      date: '2026-09-07',
      affectationId: '22222222-2222-4222-8222-222222222222',
      typeEvaluationId: '33333333-3333-4333-8333-333333333333',
      periodeScolaireId: '44444444-4444-4444-8444-444444444444',
    };
    const response = { id: 'evaluation-1' };
    evaluationServiceMock.create.mockResolvedValue(response);

    await expect(controller.create(ecoleId, dto)).resolves.toBe(response);
    expect(evaluationServiceMock.create).toHaveBeenCalledWith(dto, ecoleId);
  });

  it('délègue la recherche filtrée des évaluations', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const response = [{ id: 'evaluation-1' }];
    evaluationServiceMock.findAllBySchool.mockResolvedValue(response);

    await expect(
      controller.findAllBySchool(
        ecoleId,
        '22222222-2222-4222-8222-222222222222',
        '44444444-4444-4444-8444-444444444444',
        '55555555-5555-4555-8555-555555555555',
      ),
    ).resolves.toBe(response);
    expect(evaluationServiceMock.findAllBySchool).toHaveBeenCalledWith(
      ecoleId,
      {
        classeScolaireId: '22222222-2222-4222-8222-222222222222',
        periodeScolaireId: '44444444-4444-4444-8444-444444444444',
        matiereId: '55555555-5555-4555-8555-555555555555',
      },
    );
  });

  it('délègue la recherche d’une évaluation', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const evaluationId = '66666666-6666-4666-8666-666666666666';
    const response = { id: evaluationId };
    evaluationServiceMock.findOne.mockResolvedValue(response);

    await expect(controller.findOne(ecoleId, evaluationId)).resolves.toBe(
      response,
    );
    expect(evaluationServiceMock.findOne).toHaveBeenCalledWith(
      evaluationId,
      ecoleId,
    );
  });

  it('délègue la mise à jour d’une évaluation', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const evaluationId = '66666666-6666-4666-8666-666666666666';
    const dto = { titre: 'Devoir corrigé' };
    const response = { id: evaluationId, ...dto };
    evaluationServiceMock.update.mockResolvedValue(response);

    await expect(controller.update(ecoleId, evaluationId, dto)).resolves.toBe(
      response,
    );
    expect(evaluationServiceMock.update).toHaveBeenCalledWith(
      evaluationId,
      dto,
      ecoleId,
    );
  });

  it('délègue la suppression d’une évaluation', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const evaluationId = '66666666-6666-4666-8666-666666666666';
    const response = { id: evaluationId };
    evaluationServiceMock.remove.mockResolvedValue(response);

    await expect(controller.remove(ecoleId, evaluationId)).resolves.toBe(
      response,
    );
    expect(evaluationServiceMock.remove).toHaveBeenCalledWith(
      evaluationId,
      ecoleId,
    );
  });
});

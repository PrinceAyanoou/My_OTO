import { Test, TestingModule } from '@nestjs/testing';
import { ParentController } from './parent.controller';
import { ParentService } from './parent.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';

describe('ParentController', () => {
  let controller: ParentController;

  const parentServiceMock = {
    createParentWithUser: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findChildrenOfParentBySchool: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParentController],
      providers: [{ provide: ParentService, useValue: parentServiceMock }],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<ParentController>(ParentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue les opérations parent', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const parentId = '22222222-2222-4222-8222-222222222222';
    const dto = { nom: 'Doe' };
    const response = { id: parentId };
    parentServiceMock.createParentWithUser.mockResolvedValue(response);
    parentServiceMock.findAll.mockResolvedValue(response);
    parentServiceMock.findOne.mockResolvedValue(response);
    parentServiceMock.findChildrenOfParentBySchool.mockResolvedValue(response);
    parentServiceMock.update.mockResolvedValue(response);
    parentServiceMock.remove.mockResolvedValue(response);

    await expect(controller.create(ecoleId, dto as never)).resolves.toBe(
      response,
    );
    await expect(controller.findAll(ecoleId, dto as never)).resolves.toBe(
      response,
    );
    await expect(controller.findOne(ecoleId, parentId)).resolves.toBe(response);
    await expect(
      controller.findChildrenOfParentBySchool(ecoleId, parentId),
    ).resolves.toBe(response);
    await expect(
      controller.update(ecoleId, parentId, dto as never),
    ).resolves.toBe(response);
    await expect(controller.remove(ecoleId, parentId)).resolves.toBe(response);
    expect(parentServiceMock.createParentWithUser).toHaveBeenCalledWith(
      dto,
      ecoleId,
    );
    expect(parentServiceMock.findOne).toHaveBeenCalledWith(parentId, ecoleId);
    expect(parentServiceMock.remove).toHaveBeenCalledWith(parentId, ecoleId);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './role.controller';
import { RolesService } from './role.service';

describe('RolesController', () => {
  let controller: RolesController;

  const serviceMock = {
    createCustomRole: jest.fn(),
    readRoleForMySchool: jest.fn(),
    updateRole: jest.fn(),
    deleteRole: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [{ provide: RolesService, useValue: serviceMock }],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue les opérations rôle', async () => {
    const ecoleId = 'ecole-1';
    const roleId = 'role-1';
    const dto = { nom: 'Gestionnaire' };
    const response = { id: roleId };
    Object.values(serviceMock).forEach((mock) =>
      mock.mockResolvedValue(response),
    );
    await expect(
      controller.createCustomRole(ecoleId, dto as never),
    ).resolves.toBe(response);
    await expect(controller.readRoleForMySchool(ecoleId)).resolves.toBe(
      response,
    );
    await expect(
      controller.updateRole(ecoleId, roleId, dto as never),
    ).resolves.toBe(response);
    await expect(controller.deleteRole(ecoleId, roleId)).resolves.toBe(
      response,
    );
  });
});

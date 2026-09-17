import { Test, TestingModule } from '@nestjs/testing';
import { EcoleController } from './ecole.controller';
import { EcoleService } from './ecole.service';

describe('EcoleController', () => {
  let controller: EcoleController;

  const ecoleServiceMock = {
    findAll: jest.fn(),
    findByCode: jest.fn(),
    findOne: jest.fn(),
    addMember: jest.fn(),
    removeMember: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EcoleController],
      providers: [
        {
          provide: EcoleService,
          useValue: ecoleServiceMock,
        },
      ],
    }).compile();

    controller = module.get<EcoleController>(EcoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue la recherche des écoles', async () => {
    const response = [{ id: 'ecole-1', nom: 'Mon école' }];
    ecoleServiceMock.findAll.mockResolvedValue(response);

    await expect(controller.findAll(0, 10, 'Cotonou', 'mon')).resolves.toBe(
      response,
    );
    expect(ecoleServiceMock.findAll).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      ville: 'Cotonou',
      search: 'mon',
    });
  });

  it('délègue la recherche par code', async () => {
    const response = { id: 'ecole-1', code: 'ECO-001' };
    ecoleServiceMock.findByCode.mockResolvedValue(response);

    await expect(controller.findByCode('ECO-001')).resolves.toBe(response);
    expect(ecoleServiceMock.findByCode).toHaveBeenCalledWith('ECO-001');
  });

  it('délègue la recherche par id', async () => {
    const response = { id: '11111111-1111-4111-8111-111111111111' };
    ecoleServiceMock.findOne.mockResolvedValue(response);

    await expect(
      controller.findOne('11111111-1111-4111-8111-111111111111'),
    ).resolves.toBe(response);
    expect(ecoleServiceMock.findOne).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
    );
  });

  it('délègue l’ajout d’un membre', async () => {
    const dto = {
      userId: '22222222-2222-4222-8222-222222222222',
      role: 'EMPLOYE',
      matricule: 'E-001',
      dateEmbauche: new Date('2024-01-15T00:00:00.000Z'),
    };
    const response = { id: 'member-1' };
    ecoleServiceMock.addMember.mockResolvedValue(response);

    await expect(
      controller.addMember('11111111-1111-4111-8111-111111111111', dto as any),
    ).resolves.toBe(response);
    expect(ecoleServiceMock.addMember).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      dto,
    );
  });

  it('délègue le retrait d’un membre', async () => {
    const response = { success: true };
    ecoleServiceMock.removeMember.mockResolvedValue(response);

    await expect(
      controller.removeMember(
        '11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222',
      ),
    ).resolves.toBe(response);
    expect(ecoleServiceMock.removeMember).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
    );
  });
});

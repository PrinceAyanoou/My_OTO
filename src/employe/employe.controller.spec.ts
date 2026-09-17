import { Test, TestingModule } from '@nestjs/testing';
import { EmployeController } from './employe.controller';
import { EmployeService } from './employe.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';
import type {
  AddEmployeDocumentDto,
  CreateEmployeWithUserDto,
  QueryEmployeDto,
  UpdateEmployeDto,
} from './dto/employe.dto';

describe('EmployeController', () => {
  let controller: EmployeController;

  const employeServiceMock = {
    createEmployeWithUser: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addDocument: jest.fn(),
    removeDocument: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeController],
      providers: [
        {
          provide: EmployeService,
          useValue: employeServiceMock,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<EmployeController>(EmployeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue la création d’un employé', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const dto = {
      nom: 'DOSSOU',
      prenoms: 'Prince Ayanou',
      email: 'prince@example.com',
      telephone: '9700000000',
      matricule: 'EMP-001',
      dateEmbauche: new Date('2026-08-07T00:00:00.000Z'),
      ecoleId,
    };
    const response = { id: 'employe-1' };
    employeServiceMock.createEmployeWithUser.mockResolvedValue(response);

    await expect(
      controller.create(dto as CreateEmployeWithUserDto, ecoleId),
    ).resolves.toBe(response);
    expect(dto.ecoleId).toBe(ecoleId);
    expect(employeServiceMock.createEmployeWithUser).toHaveBeenCalledWith(dto);
  });

  it('délègue la recherche paginée des employés', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const query = { page: 2, limit: 5, search: 'DOSSOU' };
    const response = { data: [{ id: 'employe-1' }], meta: {} };
    employeServiceMock.findAll.mockResolvedValue(response);

    await expect(
      controller.findAll(ecoleId, query as QueryEmployeDto),
    ).resolves.toBe(response);
    expect(employeServiceMock.findAll).toHaveBeenCalledWith({
      ...query,
      ecoleId,
    });
  });

  it('délègue la recherche d’un employé', async () => {
    const employeId = '22222222-2222-4222-8222-222222222222';
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const response = { id: employeId };
    employeServiceMock.findOne.mockResolvedValue(response);

    await expect(controller.findOne(employeId, ecoleId)).resolves.toBe(
      response,
    );
    expect(employeServiceMock.findOne).toHaveBeenCalledWith(employeId, ecoleId);
  });

  it('délègue la mise à jour d’un employé', async () => {
    const employeId = '22222222-2222-4222-8222-222222222222';
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const dto = { matricule: 'EMP-002' };
    const response = { id: employeId, ...dto };
    employeServiceMock.update.mockResolvedValue(response);

    await expect(
      controller.update(employeId, dto as UpdateEmployeDto, ecoleId),
    ).resolves.toBe(response);
    expect(employeServiceMock.update).toHaveBeenCalledWith(
      employeId,
      dto,
      ecoleId,
    );
  });

  it('délègue la suppression d’un employé', async () => {
    const employeId = '22222222-2222-4222-8222-222222222222';
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const response = { id: employeId };
    employeServiceMock.remove.mockResolvedValue(response);

    await expect(controller.remove(employeId, ecoleId)).resolves.toBe(response);
    expect(employeServiceMock.remove).toHaveBeenCalledWith(employeId, ecoleId);
  });

  it('délègue l’ajout d’un document', async () => {
    const employeId = '22222222-2222-4222-8222-222222222222';
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const dto = { type: 'DIPLOME', titre: 'Licence' };
    const file = { buffer: Buffer.from('document') } as Express.Multer.File;
    const response = { id: 'document-1' };
    employeServiceMock.addDocument.mockResolvedValue(response);

    await expect(
      controller.addDocument(
        employeId,
        dto as Omit<AddEmployeDocumentDto, 'documentUrl'>,
        file,
        ecoleId,
      ),
    ).resolves.toBe(response);
    expect(employeServiceMock.addDocument).toHaveBeenCalledWith(
      employeId,
      dto,
      file,
      ecoleId,
    );
  });

  it('délègue la suppression d’un document', async () => {
    const documentId = '33333333-3333-4333-8333-333333333333';
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const response = { id: documentId };
    employeServiceMock.removeDocument.mockResolvedValue(response);

    await expect(controller.removeDocument(documentId, ecoleId)).resolves.toBe(
      response,
    );
    expect(employeServiceMock.removeDocument).toHaveBeenCalledWith(
      documentId,
      ecoleId,
    );
  });
});

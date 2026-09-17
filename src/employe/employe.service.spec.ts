import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { EmployeService } from './employe.service';
import type {
  AddEmployeDocumentDto,
  CreateEmployeWithUserDto,
  QueryEmployeDto,
  UpdateEmployeDto,
} from './dto/employe.dto';

const mockClerkClient = {
  invitations: {
    createInvitation: jest.fn(),
    revokeInvitation: jest.fn(),
  },
};

jest.mock('@clerk/backend', () => ({
  createClerkClient: jest.fn(() => mockClerkClient),
}));

describe('EmployeService', () => {
  let service: EmployeService;

  const txMock = {
    user: {
      create: jest.fn(),
    },
    employe: {
      create: jest.fn(),
    },
  };

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
    employe: {
      findUnique: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    employedocument: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const cloudinaryMock = {
    uploadFile: jest.fn(),
    extractPublicIdFromUrl: jest.fn(),
    deleteFile: jest.fn(),
  };

  const ecoleId = '11111111-1111-4111-8111-111111111111';
  const employeId = '22222222-2222-4222-8222-222222222222';
  const createDto: CreateEmployeWithUserDto = {
    nom: 'DOSSOU',
    prenoms: 'Prince Ayanou',
    email: 'prince@example.com',
    telephone: '9700000000',
    matricule: 'EMP-001',
    dateEmbauche: new Date('2026-08-07T00:00:00.000Z'),
    ecoleId,
    rolesIds: ['33333333-3333-4333-8333-333333333333'],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockClerkClient.invitations.createInvitation.mockResolvedValue({
      id: 'invitation-1',
    });
    mockClerkClient.invitations.revokeInvitation.mockResolvedValue(undefined);
    prismaMock.$transaction.mockImplementation(
      (callback: (tx: typeof txMock) => Promise<unknown>) => callback(txMock),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: CloudinaryService,
          useValue: cloudinaryMock,
        },
      ],
    }).compile();

    service = module.get<EmployeService>(EmployeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEmployeWithUser', () => {
    it('crée l’utilisateur et l’employé après l’invitation Clerk', async () => {
      const user = { id: 'user-1', clerkUserId: 'invitation-1' };
      const employe = { id: employeId, matricule: createDto.matricule };
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.employe.findUnique.mockResolvedValue(null);
      txMock.user.create.mockResolvedValue(user);
      txMock.employe.create.mockResolvedValue(employe);

      await expect(service.createEmployeWithUser(createDto)).resolves.toEqual({
        message: 'Invitation envoyée par e-mail avec succès.',
        employe,
      });

      expect(mockClerkClient.invitations.createInvitation).toHaveBeenCalledWith(
        expect.objectContaining({
          emailAddress: createDto.email,
          redirectUrl: 'http://localhost:3001/sign-up',
        }),
      );
      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(txMock.user.create).toHaveBeenCalled();
      expect(txMock.employe.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            clerkUserId: 'invitation-1',
            matricule: createDto.matricule,
            ecoleId,
            employerole: {
              create: [{ roleId: createDto.rolesIds?.[0] }],
            },
          }),
        }),
      );
    });

    it('refuse un email déjà utilisé', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(service.createEmployeWithUser(createDto)).rejects.toThrow(
        new ConflictException(
          `Un utilisateur avec l'email ${createDto.email} existe déjà.`,
        ),
      );
      expect(mockClerkClient.invitations.createInvitation).not.toHaveBeenCalled();
    });

    it('transforme l’échec de Clerk en erreur serveur', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.employe.findUnique.mockResolvedValue(null);
      mockClerkClient.invitations.createInvitation.mockRejectedValue(
        new Error('Clerk indisponible'),
      );

      await expect(service.createEmployeWithUser(createDto)).rejects.toThrow(
        'Erreur lors de l\'envoi de l\'invitation Clerk',
      );
    });
  });

  describe('findAll', () => {
    it('retourne les employés paginés et filtrés', async () => {
      const query: QueryEmployeDto = {
        page: 2,
        limit: 10,
        search: 'DOSSOU',
        roleId: '33333333-3333-4333-8333-333333333333',
        ecoleId,
      };
      const data = [{ id: employeId }];
      prismaMock.employe.count.mockResolvedValue(25);
      prismaMock.employe.findMany.mockResolvedValue(data);

      await expect(service.findAll(query)).resolves.toEqual({
        data,
        meta: { total: 25, page: 2, limit: 10, totalPages: 3 },
      });
      expect(prismaMock.employe.count).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              OR: [
                { matricule: { contains: 'DOSSOU' } },
                { user: { nom: { contains: 'DOSSOU' } } },
                { user: { prenoms: { contains: 'DOSSOU' } } },
                { user: { email: { contains: 'DOSSOU' } } },
              ],
            },
            { employerole: { some: { roleId: query.roleId } } },
            { ecoleId },
          ],
        },
      });
      expect(prismaMock.employe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10, orderBy: { createdAt: 'desc' } }),
      );
    });
  });

  describe('findOne', () => {
    it('retourne l’employé appartenant à l’école', async () => {
      const response = { id: employeId, ecoleId };
      prismaMock.employe.findFirst.mockResolvedValue(response);

      await expect(service.findOne(employeId, ecoleId)).resolves.toBe(response);
      expect(prismaMock.employe.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: employeId, ecoleId },
        }),
      );
    });

    it('lève NotFoundException si l’employé est introuvable', async () => {
      prismaMock.employe.findFirst.mockResolvedValue(null);

      await expect(service.findOne(employeId, ecoleId)).rejects.toThrow(
        `Employé avec l'ID '${employeId}' introuvable pour cette école.`,
      );
    });
  });

  describe('update', () => {
    it('met à jour les informations professionnelles', async () => {
      const dto: UpdateEmployeDto = { matricule: 'EMP-002' };
      const current = { id: employeId, ecoleId };
      const response = { id: employeId, ...dto };
      prismaMock.employe.findFirst.mockResolvedValue(current);
      prismaMock.employe.findUnique.mockResolvedValue(null);
      prismaMock.employe.update.mockResolvedValue(response);

      await expect(service.update(employeId, dto, ecoleId)).resolves.toBe(
        response,
      );
      expect(prismaMock.employe.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: employeId },
          data: { matricule: 'EMP-002', dateEmbauche: undefined },
        }),
      );
    });
  });

  describe('remove', () => {
    it('supprime l’employé trouvé dans l’école', async () => {
      prismaMock.employe.findFirst.mockResolvedValue({ id: employeId });
      prismaMock.employe.delete.mockResolvedValue({ id: employeId });

      await expect(service.remove(employeId, ecoleId)).resolves.toEqual({
        id: employeId,
      });
      expect(prismaMock.employe.delete).toHaveBeenCalledWith({
        where: { id: employeId },
      });
    });
  });

  describe('addDocument', () => {
    it('upload le fichier puis sauvegarde son URL', async () => {
      const dto = {
        type: 'DIPLOME',
        titre: 'Licence',
      } as Omit<AddEmployeDocumentDto, 'documentUrl'>;
      const file = { buffer: Buffer.from('document') } as Express.Multer.File;
      const response = { id: 'document-1', documentUrl: 'https://cloudinary.test/doc.pdf' };
      prismaMock.employe.findFirst.mockResolvedValue({ id: employeId });
      cloudinaryMock.uploadFile.mockResolvedValue({
        secure_url: response.documentUrl,
      });
      prismaMock.employedocument.create.mockResolvedValue(response);

      await expect(service.addDocument(employeId, dto, file, ecoleId)).resolves.toBe(
        response,
      );
      expect(cloudinaryMock.uploadFile).toHaveBeenCalledWith(file, 'employes_docs');
      expect(prismaMock.employedocument.create).toHaveBeenCalledWith({
        data: {
          employeId,
          type: dto.type,
          titre: dto.titre,
          documentUrl: response.documentUrl,
        },
      });
    });

    it('refuse un document sans fichier', async () => {
      prismaMock.employe.findFirst.mockResolvedValue({ id: employeId });

      await expect(
        service.addDocument(
          employeId,
          { type: 'DIPLOME', titre: 'Licence' } as Omit<
            AddEmployeDocumentDto,
            'documentUrl'
          >,
          undefined as unknown as Express.Multer.File,
          ecoleId,
        ),
      ).rejects.toThrow(new BadRequestException('Aucun fichier fourni.'));
    });
  });

  describe('removeDocument', () => {
    it('supprime le fichier distant puis le document en base', async () => {
      const documentUrl = 'https://res.cloudinary.com/demo/image/upload/v1/employes_docs/doc.pdf';
      prismaMock.employedocument.findUnique.mockResolvedValue({
        id: 'document-1',
        documentUrl,
      });
      cloudinaryMock.extractPublicIdFromUrl.mockReturnValue('employes_docs/doc');
      cloudinaryMock.deleteFile.mockResolvedValue(undefined);
      prismaMock.employedocument.delete.mockResolvedValue({ id: 'document-1' });

      await expect(
        service.removeDocument('document-1', ecoleId),
      ).resolves.toEqual({ id: 'document-1' });
      expect(cloudinaryMock.extractPublicIdFromUrl).toHaveBeenCalledWith(
        documentUrl,
      );
      expect(cloudinaryMock.deleteFile).toHaveBeenCalledWith('employes_docs/doc');
      expect(prismaMock.employedocument.delete).toHaveBeenCalledWith({
        where: { id: 'document-1' },
      });
    });
  });
});

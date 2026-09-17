import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { DemandeEcoleService } from './demande-ecole.service';

type DemanderCreationInput = Parameters<
  DemandeEcoleService['demanderCreation']
>[1];
type DemanderModificationInput = Parameters<
  DemandeEcoleService['demanderModification']
>[1];
type DemanderSuppressionInput = Parameters<
  DemandeEcoleService['demanderSuppression']
>[1];

type TransactionMock = {
  ecole: {
    update: jest.Mock;
  };
  demandeecole: {
    create: jest.Mock;
    update: jest.Mock;
  };
};

type PrismaMock = {
  user: {
    findUnique: jest.Mock;
  };
  ecole: {
    findUnique: jest.Mock;
  };
  demandeecole: {
    create: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
  };
  $transaction: jest.Mock;
};

describe('DemandeEcoleService', () => {
  let service: DemandeEcoleService;

  const prismaMock: PrismaMock = {
    user: { findUnique: jest.fn() },
    ecole: { findUnique: jest.fn() },
    demandeecole: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const user = { id: 'user-1', clerkUserId: 'clerk-user-1' } as const;
  const ecole = {
    id: 'ecole-1',
    createurId: 'clerk-user-1',
    statut: 'ACTIF',
  } as const;
  const ecoleId = '11111111-1111-4111-8111-111111111111';

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DemandeEcoleService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<DemandeEcoleService>(DemandeEcoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('demanderCreation', () => {
    const dto: DemanderCreationInput = {
      nom: 'Nouvelle école',
      type: 'MATERNELLE_PRIMAIRE',
      nomFondateur: 'Jean Dupont',
      ville: 'Cotonou',
      boitePostale: 'BP 123',
      email: 'contact@example.com',
      telephone: '+22997000000',
      description: 'Description',
    };

    it('renvoie une erreur si l’utilisateur n’existe pas', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.demanderCreation('clerk-user-1', dto),
      ).rejects.toThrow(NotFoundException);
      expect(prismaMock.demandeecole.create).not.toHaveBeenCalled();
    });

    it('crée une demande de création', async () => {
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.demandeecole.create.mockResolvedValue({ id: 'demande-1' });

      await expect(
        service.demanderCreation('clerk-user-1', dto),
      ).resolves.toEqual({ id: 'demande-1' });
      expect(prismaMock.demandeecole.create).toHaveBeenCalledWith({
        data: {
          demandeurId: 'clerk-user-1',
          type: 'CREATION',
          nomPropose: dto.nom,
          typePropose: dto.type,
          nomFondateurPropose: dto.nomFondateur,
          villePropose: dto.ville,
          boitePostalePropose: dto.boitePostale,
          emailPropose: dto.email,
          telephonePropose: dto.telephone,
          descriptionPropose: dto.description,
        },
      });
    });
  });

  describe('demanderModification', () => {
    const dto: DemanderModificationInput = {
      ecoleId,
      motif: 'Besoin de changement',
      donnees: {
        nom: 'Nouvel intitulé',
        ville: 'Porto-Novo',
      },
    };

    it('rejette une école inexistante', async () => {
      prismaMock.ecole.findUnique.mockResolvedValue(null);

      await expect(
        service.demanderModification('clerk-user-1', dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejette un utilisateur non créateur', async () => {
      prismaMock.ecole.findUnique.mockResolvedValue(ecole);
      prismaMock.user.findUnique.mockResolvedValue({
        ...user,
        clerkUserId: 'other',
      });

      await expect(
        service.demanderModification('clerk-user-1', dto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('met à jour une demande existante de modification', async () => {
      const txMock: TransactionMock = {
        ecole: { update: jest.fn().mockResolvedValue(undefined) },
        demandeecole: {
          update: jest.fn().mockResolvedValue({ id: 'demande-2' }),
          create: jest.fn(),
        },
      };

      prismaMock.ecole.findUnique.mockResolvedValue(ecole);
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.demandeecole.findFirst.mockResolvedValue({
        id: 'demande-2',
        type: 'MODIFICATION',
        nomPropose: 'Ancien nom',
      });
      prismaMock.$transaction.mockImplementation(
        (callback: (tx: TransactionMock) => unknown) => callback(txMock),
      );

      await expect(
        service.demanderModification('clerk-user-1', dto),
      ).resolves.toEqual({ id: 'demande-2' });
      expect(txMock.ecole.update).toHaveBeenCalledWith({
        where: { id: ecoleId },
        data: { statut: 'TRAITEMENT_MODIFICATION' },
      });
      const updateCall = (
        txMock.demandeecole.update.mock.calls[0] as [
          { where: { id: string }; data: Record<string, unknown> },
        ]
      )[0];

      expect(updateCall.where).toEqual({ id: 'demande-2' });
      expect(updateCall.data).toEqual(
        expect.objectContaining({
          nomPropose: 'Nouvel intitulé',
          villePropose: 'Porto-Novo',
          motif: 'Besoin de changement',
        }),
      );
    });

    it('crée une première demande de modification', async () => {
      const txMock: TransactionMock = {
        ecole: { update: jest.fn().mockResolvedValue(undefined) },
        demandeecole: {
          create: jest.fn().mockResolvedValue({ id: 'demande-3' }),
          update: jest.fn(),
        },
      };

      prismaMock.ecole.findUnique.mockResolvedValue(ecole);
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.demandeecole.findFirst.mockResolvedValue(null);
      prismaMock.$transaction.mockImplementation(
        (callback: (tx: TransactionMock) => unknown) => callback(txMock),
      );

      await expect(
        service.demanderModification('clerk-user-1', dto),
      ).resolves.toEqual({ id: 'demande-3' });
      const createCall = (
        txMock.demandeecole.create.mock.calls[0] as [
          { data: Record<string, unknown> },
        ]
      )[0];

      expect(createCall.data).toEqual(
        expect.objectContaining({
          ecoleId,
          demandeurId: 'clerk-user-1',
          type: 'MODIFICATION',
          nomPropose: 'Nouvel intitulé',
          villePropose: 'Porto-Novo',
          motif: 'Besoin de changement',
        }),
      );
    });

    it('refuse une demande de modification quand une autre est déjà en cours', async () => {
      const txMock: TransactionMock = {
        ecole: { update: jest.fn() },
        demandeecole: { create: jest.fn(), update: jest.fn() },
      };

      prismaMock.ecole.findUnique.mockResolvedValue(ecole);
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.demandeecole.findFirst.mockResolvedValue({
        id: 'demande-4',
        type: 'CREATION',
      });
      prismaMock.$transaction.mockImplementation(
        (callback: (tx: TransactionMock) => unknown) => callback(txMock),
      );

      await expect(
        service.demanderModification('clerk-user-1', dto),
      ).rejects.toThrow(BadRequestException);
      expect(txMock.demandeecole.update).not.toHaveBeenCalled();
    });
  });

  describe('demanderSuppression', () => {
    const dto: DemanderSuppressionInput = {
      ecoleId,
      motif: 'Raison de suppression',
    };

    it('crée une demande de suppression', async () => {
      const txMock: TransactionMock = {
        ecole: { update: jest.fn().mockResolvedValue(undefined) },
        demandeecole: {
          create: jest.fn().mockResolvedValue({ id: 'demande-sup' }),
          update: jest.fn(),
        },
      };

      prismaMock.ecole.findUnique.mockResolvedValue(ecole);
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.demandeecole.findFirst.mockResolvedValue(null);
      prismaMock.$transaction.mockImplementation(
        (callback: (tx: TransactionMock) => unknown) => callback(txMock),
      );

      await expect(
        service.demanderSuppression('clerk-user-1', dto),
      ).resolves.toEqual({ id: 'demande-sup' });
      expect(txMock.ecole.update).toHaveBeenCalledWith({
        where: { id: ecoleId },
        data: { statut: 'TRAITEMENT_SUPPRESSION' },
      });
      expect(txMock.demandeecole.create).toHaveBeenCalledWith({
        data: {
          ecoleId,
          demandeurId: 'clerk-user-1',
          type: 'SUPPRESSION',
          motif: 'Raison de suppression',
        },
      });
    });

    it('rejette si une demande est déjà en cours', async () => {
      prismaMock.ecole.findUnique.mockResolvedValue(ecole);
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.demandeecole.findFirst.mockResolvedValue({ id: 'demande-5' });

      await expect(
        service.demanderSuppression('clerk-user-1', dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findDemandesByEcole', () => {
    it('retourne les demandes associées à une école', async () => {
      const demandes = [{ id: 'd1' }];

      prismaMock.ecole.findUnique.mockResolvedValue(ecole);
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.demandeecole.findMany.mockResolvedValue(demandes);

      await expect(
        service.findDemandesByEcole(ecoleId, 'clerk-user-1'),
      ).resolves.toEqual(demandes);
      expect(prismaMock.demandeecole.findMany).toHaveBeenCalledWith({
        where: { ecoleId },
        include: {
          demandeur: {
            select: { id: true, nom: true, prenoms: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('rejette un utilisateur non autorisé', async () => {
      prismaMock.ecole.findUnique.mockResolvedValue(ecole);
      prismaMock.user.findUnique.mockResolvedValue({
        ...user,
        clerkUserId: 'other',
      });

      await expect(
        service.findDemandesByEcole(ecoleId, 'clerk-user-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});

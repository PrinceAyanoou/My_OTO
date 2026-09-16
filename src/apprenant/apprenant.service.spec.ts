import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ApprenantService } from './apprenant.service';

describe('ApprenantService', () => {
  let service: ApprenantService;

  const ecoleId = 'ecole-123';
  const apprenantId = 'apprenant-123';
  const anneeScolaireId = 'annee-123';
  const classeScolaireId = 'classe-123';
  const configurationId = 'config-123';

  const prismaMock = {
    ecole: {
      findUnique: jest.fn(),
    },

    anneescolaire: {
      findFirst: jest.fn(),
    },

    classscolaire: {
      findFirst: jest.fn(),
    },

    configurationscolarite: {
      findFirst: jest.fn(),
    },

    apprenant: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },

    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },

    inscription: {
      create: jest.fn(),
    },

    dossierscolarite: {
      create: jest.fn(),
    },

    $transaction: jest.fn(),
  };

  const ecoleMock = {
    id: ecoleId,
    nom: 'École Test',
  };

  const anneeScolaireMock = {
    id: anneeScolaireId,
    nom: '2026-2027',
    ecoleId,
  };

  const classeMock = {
    id: classeScolaireId,
    capacite: 50,
    _count: {
      inscription: 10,
    },
  };

  const configurationMock = {
    id: configurationId,
    anneeScolaireId,
    ecoleId,
    tranchescolarite: [
      { id: 'tranche-1', montant: 100000 },
      { id: 'tranche-2', montant: 50000 },
    ],
  };

  const apprenantMock = {
    id: apprenantId,
    matricule: 'MAT-001',
    nom: 'Doe',
    prenoms: 'John',
    Sexe: 'Homme',
    dateNaissance: new Date('2010-01-01'),
    userId: null,
  };

  const inscriptionMock = {
    apprenantId,
    matricule: 'MAT-001',
    anneeScolaireId,
    classeScolaireId,
    configuartionScolariteId: configurationId,
    type: 'NOUVELLE',
  };

  const dossierMock = {
    id: 'dossier-123',
    montant: 150000,
    resteAPayer: 150000,
    statut: 'EN_RETARD',
    inscriptionApprenantId: apprenantId,
    inscriptionAnneeId: anneeScolaireId,
    configurationScolariteId: configurationId,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprenantService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ApprenantService>(ApprenantService);

    /*
     * Le service crée directement son client Clerk avec createClerkClient().
     * On remplace donc l'instance privée pour pouvoir contrôler les appels Clerk.
     */
    Object.defineProperty(service, 'clerkClient', {
      value: {
        invitations: {
          createInvitation: jest.fn(),
          revokeInvitation: jest.fn(),
        },
      },
      writable: true,
    });
  });

  // ============================================================
  // SHOULD BE DEFINED
  // ============================================================

  describe('should be defined', () => {
    it('devrait être défini', () => {
      expect(service).toBeDefined();
    });
  });

  // ============================================================
  // CREATE
  // ============================================================

  describe('create', () => {
    const dto = {
      matricule: 'MAT-001',
      nom: 'Doe',
      prenoms: 'John',
      Sexe: 'MASCULIN' as const,
      dateNaissance: '2010-01-01',
      anneeScolaireId,
      classeScolaireId,
      configuartionScolariteId: configurationId,
      telephone: '+22990000000',
      type: 'INSCRIPTION' as const,
    };

    beforeEach(() => {
      prismaMock.ecole.findUnique.mockResolvedValue(ecoleMock);
      prismaMock.anneescolaire.findFirst.mockResolvedValue(anneeScolaireMock);
      prismaMock.classscolaire.findFirst.mockResolvedValue(classeMock);
      prismaMock.configurationscolarite.findFirst.mockResolvedValue(
        configurationMock,
      );
      prismaMock.apprenant.findUnique.mockResolvedValue(null);
    });

    it('devrait créer un apprenant sans email', async () => {
      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) => {
          return callback(prismaMock);
        },
      );

      prismaMock.apprenant.create.mockResolvedValue(apprenantMock);
      prismaMock.inscription.create.mockResolvedValue(inscriptionMock);
      prismaMock.dossierscolarite.create.mockResolvedValue(dossierMock);

      const result = await service.create(dto, ecoleId);

      expect(prismaMock.ecole.findUnique).toHaveBeenCalledWith({
        where: { id: ecoleId },
      });

      expect(prismaMock.anneescolaire.findFirst).toHaveBeenCalledWith({
        where: {
          id: anneeScolaireId,
          ecoleId,
        },
      });

      expect(prismaMock.classscolaire.findFirst).toHaveBeenCalled();

      expect(prismaMock.configurationscolarite.findFirst).toHaveBeenCalled();

      expect(prismaMock.apprenant.create).toHaveBeenCalledWith({
        data: {
          userId: undefined,
          matricule: 'MAT-001',
          nom: 'Doe',
          prenoms: 'John',
          Sexe: 'MASCULIN',
          dateNaissance: new Date('2010-01-01'),
        },
      });

      expect(prismaMock.inscription.create).toHaveBeenCalled();

      expect(prismaMock.dossierscolarite.create).toHaveBeenCalledWith({
        data: {
          montant: 150000,
          resteAPayer: 150000,
          statut: 'EN_RETARD',
          inscriptionApprenantId: apprenantId,
          inscriptionAnneeId: anneeScolaireId,
          configurationScolariteId: configurationId,
        },
      });

      expect(result).toEqual({
        message: 'Apprenant créé et inscrit.',
        apprenant: apprenantMock,
        inscription: inscriptionMock,
        user: null,
        scolarite: dossierMock,
        invitationEnvoyee: false,
        invitationId: null,
      });
    });

    it("devrait lever NotFoundException si l'école n'existe pas", async () => {
      prismaMock.ecole.findUnique.mockResolvedValue(null);

      await expect(service.create(dto, ecoleId)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.anneescolaire.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.apprenant.create).not.toHaveBeenCalled();
    });

    it("devrait lever NotFoundException si l'année scolaire n'existe pas", async () => {
      prismaMock.anneescolaire.findFirst.mockResolvedValue(null);

      await expect(service.create(dto, ecoleId)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.classscolaire.findFirst).not.toHaveBeenCalled();
    });

    it("devrait lever NotFoundException si la classe n'existe pas", async () => {
      prismaMock.classscolaire.findFirst.mockResolvedValue(null);

      await expect(service.create(dto, ecoleId)).rejects.toThrow(
        NotFoundException,
      );

      expect(
        prismaMock.configurationscolarite.findFirst,
      ).not.toHaveBeenCalled();
    });

    it('devrait refuser la création si la classe est pleine', async () => {
      prismaMock.classscolaire.findFirst.mockResolvedValue({
        ...classeMock,
        capacite: 10,
        _count: {
          inscription: 10,
        },
      });

      await expect(service.create(dto, ecoleId)).rejects.toThrow(
        BadRequestException,
      );

      expect(
        prismaMock.configurationscolarite.findFirst,
      ).not.toHaveBeenCalled();
    });

    it('devrait refuser la création si la configuration scolaire est invalide', async () => {
      prismaMock.configurationscolarite.findFirst.mockResolvedValue(null);

      await expect(service.create(dto, ecoleId)).rejects.toThrow(
        BadRequestException,
      );

      expect(prismaMock.apprenant.findUnique).not.toHaveBeenCalled();
    });

    it('devrait refuser un matricule déjà utilisé', async () => {
      prismaMock.apprenant.findUnique.mockResolvedValue(apprenantMock);

      await expect(service.create(dto, ecoleId)).rejects.toThrow(
        ConflictException,
      );

      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('devrait vérifier le matricule globalement', async () => {
      prismaMock.apprenant.findUnique.mockResolvedValue(null);

      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
          callback(prismaMock),
      );

      prismaMock.apprenant.create.mockResolvedValue(apprenantMock);
      prismaMock.inscription.create.mockResolvedValue(inscriptionMock);
      prismaMock.dossierscolarite.create.mockResolvedValue(dossierMock);

      await service.create(dto, ecoleId);

      expect(prismaMock.apprenant.findUnique).toHaveBeenCalledWith({
        where: {
          matricule: dto.matricule,
        },
      });
    });

    it('devrait créer une invitation Clerk lorsqu’un email est fourni', async () => {
      const createInvitation = (
        service as unknown as {
          clerkClient: {
            invitations: {
              createInvitation: jest.Mock;
            };
          };
        }
      ).clerkClient.invitations.createInvitation;

      createInvitation.mockResolvedValue({
        id: 'invitation-123',
      });

      const dtoWithEmail = {
        ...dto,
        email: 'john@example.com',
      };

      prismaMock.user.findUnique.mockResolvedValue(null);

      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
          callback(prismaMock),
      );

      const createdUser = {
        id: 'user-123',
        clerkUserId: 'invitation-123',
        email: dtoWithEmail.email,
      };

      prismaMock.user.create.mockResolvedValue(createdUser);
      prismaMock.apprenant.create.mockResolvedValue({
        ...apprenantMock,
        userId: createdUser.id,
      });
      prismaMock.inscription.create.mockResolvedValue(inscriptionMock);
      prismaMock.dossierscolarite.create.mockResolvedValue(dossierMock);

      const result = await service.create(dtoWithEmail, ecoleId);

      const invitationArgs = (
        createInvitation.mock.calls as unknown[][]
      )[0]?.[0] as {
        emailAddress: string;
        redirectUrl: string;
        publicMetadata: {
          nom: string;
          prenoms: string;
          ecoleId: string;
        };
      };

      expect(invitationArgs).toMatchObject({
        emailAddress: 'john@example.com',
        publicMetadata: {
          nom: 'Doe',
          prenoms: 'John',
          ecoleId,
        },
      });
      expect(typeof invitationArgs.redirectUrl).toBe('string');

      expect(result.invitationEnvoyee).toBe(true);
      expect(result.invitationId).toBe('invitation-123');
    });

    it("devrait lever ConflictException si l'email appartient déjà à l'école", async () => {
      const dtoWithEmail = {
        ...dto,
        email: 'john@example.com',
      };

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-existant',
        email: 'john@example.com',
        ecole: [{ id: ecoleId }],
      });

      await expect(service.create(dtoWithEmail, ecoleId)).rejects.toThrow(
        ConflictException,
      );

      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('devrait permettre un email appartenant à une autre école', async () => {
      const dtoWithEmail = {
        ...dto,
        email: 'john@example.com',
      };

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-existant',
        email: 'john@example.com',
        ecole: [{ id: 'autre-ecole' }],
      });

      const createInvitation = (
        service as unknown as {
          clerkClient: {
            invitations: {
              createInvitation: jest.Mock;
            };
          };
        }
      ).clerkClient.invitations.createInvitation;

      createInvitation.mockResolvedValue({
        id: 'invitation-123',
      });

      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
          callback(prismaMock),
      );

      prismaMock.user.create.mockResolvedValue({
        id: 'user-123',
      });
      prismaMock.apprenant.create.mockResolvedValue(apprenantMock);
      prismaMock.inscription.create.mockResolvedValue(inscriptionMock);
      prismaMock.dossierscolarite.create.mockResolvedValue(dossierMock);

      const result = await service.create(dtoWithEmail, ecoleId);

      expect(result.invitationEnvoyee).toBe(true);
    });

    it('devrait lever InternalServerErrorException si Clerk échoue', async () => {
      const dtoWithEmail = {
        ...dto,
        email: 'john@example.com',
      };

      const createInvitation = (
        service as unknown as {
          clerkClient: {
            invitations: {
              createInvitation: jest.Mock;
            };
          };
        }
      ).clerkClient.invitations.createInvitation;

      createInvitation.mockRejectedValue(new Error('Clerk indisponible'));

      await expect(service.create(dtoWithEmail, ecoleId)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('devrait calculer correctement le montant total de la scolarité', async () => {
      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
          callback(prismaMock),
      );

      prismaMock.apprenant.create.mockResolvedValue(apprenantMock);
      prismaMock.inscription.create.mockResolvedValue(inscriptionMock);
      prismaMock.dossierscolarite.create.mockResolvedValue(dossierMock);

      await service.create(dto, ecoleId);

      const dossierArgs = (
        prismaMock.dossierscolarite.create.mock.calls as unknown[][]
      )[0]?.[0] as {
        data: {
          montant: number;
          resteAPayer: number;
        };
      };

      expect(dossierArgs.data).toMatchObject({
        montant: 150000,
        resteAPayer: 150000,
      });
    });

    it('devrait révoquer l’invitation Clerk si la transaction échoue', async () => {
      const dtoWithEmail = {
        ...dto,
        email: 'john@example.com',
      };

      const createInvitation = (
        service as unknown as {
          clerkClient: {
            invitations: {
              createInvitation: jest.Mock;
              revokeInvitation: jest.Mock;
            };
          };
        }
      ).clerkClient.invitations.createInvitation;

      const revokeInvitation = (
        service as unknown as {
          clerkClient: {
            invitations: {
              createInvitation: jest.Mock;
              revokeInvitation: jest.Mock;
            };
          };
        }
      ).clerkClient.invitations.revokeInvitation;

      createInvitation.mockResolvedValue({
        id: 'invitation-123',
      });

      prismaMock.user.findUnique.mockResolvedValue(null);

      prismaMock.$transaction.mockRejectedValue(
        new Error('Erreur transaction'),
      );

      await expect(service.create(dtoWithEmail, ecoleId)).rejects.toThrow(
        'Erreur transaction',
      );

      expect(revokeInvitation).toHaveBeenCalledWith('invitation-123');
    });
  });

  // ============================================================
  // FIND ALL
  // ============================================================

  describe('findAll', () => {
    const baseQuery = {
      page: 1,
      limit: 10,
    };

    it('devrait retourner les apprenants avec pagination', async () => {
      prismaMock.apprenant.count.mockResolvedValue(25);
      prismaMock.apprenant.findMany.mockResolvedValue([apprenantMock]);

      const result = await service.findAll(baseQuery, ecoleId);

      expect(prismaMock.apprenant.count).toHaveBeenCalledTimes(1);
      expect(prismaMock.apprenant.findMany).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        data: [apprenantMock],
        meta: {
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3,
        },
      });
    });

    it('devrait utiliser page=1 et limit=10 si les valeurs sont absentes', async () => {
      prismaMock.apprenant.count.mockResolvedValue(0);
      prismaMock.apprenant.findMany.mockResolvedValue([]);

      await service.findAll({} as never, ecoleId);

      expect(prismaMock.apprenant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
    });

    it('devrait calculer correctement le skip', async () => {
      prismaMock.apprenant.count.mockResolvedValue(50);
      prismaMock.apprenant.findMany.mockResolvedValue([]);

      await service.findAll(
        {
          page: 3,
          limit: 10,
        },
        ecoleId,
      );

      expect(prismaMock.apprenant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });

    it('devrait appliquer le filtre search', async () => {
      prismaMock.apprenant.count.mockResolvedValue(1);
      prismaMock.apprenant.findMany.mockResolvedValue([]);

      await service.findAll(
        {
          page: 1,
          limit: 10,
          search: 'Doe',
        },
        ecoleId,
      );

      const call = (
        prismaMock.apprenant.findMany.mock.calls as unknown[][]
      )[0]?.[0] as {
        where: {
          AND: Array<unknown>;
        };
      };

      expect(call.where.AND).toContainEqual({
        OR: [
          { matricule: { contains: 'Doe' } },
          { nom: { contains: 'Doe' } },
          { prenoms: { contains: 'Doe' } },
          { user: { email: { contains: 'Doe' } } },
        ],
      });
    });

    it('devrait appliquer le filtre matricule', async () => {
      prismaMock.apprenant.count.mockResolvedValue(1);
      prismaMock.apprenant.findMany.mockResolvedValue([]);

      await service.findAll(
        {
          page: 1,
          limit: 10,
          matricule: 'MAT',
        },
        ecoleId,
      );

      const call = (
        prismaMock.apprenant.findMany.mock.calls as unknown[][]
      )[0]?.[0] as {
        where: {
          AND: Array<unknown>;
        };
      };

      expect(call.where.AND).toContainEqual({
        matricule: { contains: 'MAT' },
      });
    });

    it('devrait appliquer le filtre sexe', async () => {
      prismaMock.apprenant.count.mockResolvedValue(1);
      prismaMock.apprenant.findMany.mockResolvedValue([]);

      await service.findAll(
        {
          page: 1,
          limit: 10,
          sexe: 'MASCULIN',
        },
        ecoleId,
      );

      const call = (
        prismaMock.apprenant.findMany.mock.calls as unknown[][]
      )[0]?.[0] as {
        where: {
          AND: Array<unknown>;
        };
      };

      expect(call.where.AND).toContainEqual({
        Sexe: 'MASCULIN',
      });
    });

    it('devrait appliquer le filtre userId', async () => {
      prismaMock.apprenant.count.mockResolvedValue(1);
      prismaMock.apprenant.findMany.mockResolvedValue([]);

      await service.findAll(
        {
          page: 1,
          limit: 10,
          userId: 'user-123',
        },
        ecoleId,
      );

      const call = (
        prismaMock.apprenant.findMany.mock.calls as unknown[][]
      )[0]?.[0] as {
        where: {
          AND: Array<unknown>;
        };
      };

      expect(call.where.AND).toContainEqual({
        userId: 'user-123',
      });
    });

    it("devrait filtrer les apprenants par école via l'inscription", async () => {
      prismaMock.apprenant.count.mockResolvedValue(0);
      prismaMock.apprenant.findMany.mockResolvedValue([]);

      await service.findAll(baseQuery, ecoleId);

      const call = (
        prismaMock.apprenant.findMany.mock.calls as unknown[][]
      )[0]?.[0] as {
        where: {
          AND: Array<{
            inscription?: unknown;
          }>;
        };
      };

      expect(call.where.AND).toContainEqual({
        inscription: {
          some: {
            anneescolaire: {
              ecoleId,
            },
          },
        },
      });
    });

    it('devrait appliquer année scolaire et classe scolaire', async () => {
      prismaMock.apprenant.count.mockResolvedValue(0);
      prismaMock.apprenant.findMany.mockResolvedValue([]);

      await service.findAll(
        {
          page: 1,
          limit: 10,
          anneeScolaireId,
          classeScolaireId,
        },
        ecoleId,
      );

      const call = (
        prismaMock.apprenant.findMany.mock.calls as unknown[][]
      )[0]?.[0] as {
        where: {
          AND: Array<{
            inscription?: {
              some?: {
                anneeScolaireId?: string;
                classeScolaireId?: string;
              };
            };
          }>;
        };
      };

      expect(call.where.AND).toContainEqual({
        inscription: {
          some: {
            anneeScolaireId,
            classeScolaireId,
            anneescolaire: {
              ecoleId,
            },
          },
        },
      });
    });

    it('devrait calculer correctement totalPages', async () => {
      prismaMock.apprenant.count.mockResolvedValue(21);
      prismaMock.apprenant.findMany.mockResolvedValue([]);

      const result = await service.findAll(
        {
          page: 2,
          limit: 10,
        },
        ecoleId,
      );

      expect(result.meta.totalPages).toBe(3);
    });
  });

  // ============================================================
  // FIND ONE
  // ============================================================

  describe('findOne', () => {
    it('devrait retourner un apprenant existant', async () => {
      prismaMock.apprenant.findFirst.mockResolvedValue(apprenantMock);

      const result = await service.findOne(apprenantId, ecoleId);

      expect(prismaMock.apprenant.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: apprenantId,
            inscription: {
              some: {
                anneescolaire: {
                  ecoleId,
                },
              },
            },
          },
        }),
      );

      expect(result).toEqual(apprenantMock);
    });

    it("devrait lever NotFoundException si l'apprenant n'existe pas", async () => {
      prismaMock.apprenant.findFirst.mockResolvedValue(null);

      await expect(service.findOne(apprenantId, ecoleId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("ne devrait pas retourner un apprenant d'une autre école", async () => {
      prismaMock.apprenant.findFirst.mockResolvedValue(null);

      await expect(service.findOne(apprenantId, 'autre-ecole')).rejects.toThrow(
        NotFoundException,
      );

      const findFirstArgs = (
        prismaMock.apprenant.findFirst.mock.calls as unknown[][]
      )[0]?.[0] as {
        where: {
          id: string;
          inscription: {
            some: {
              anneescolaire: {
                ecoleId: string;
              };
            };
          };
        };
      };

      expect(findFirstArgs.where).toMatchObject({
        id: apprenantId,
        inscription: {
          some: {
            anneescolaire: {
              ecoleId: 'autre-ecole',
            },
          },
        },
      });
    });
  });

  // ============================================================
  // UPDATE
  // ============================================================

  describe('update', () => {
    beforeEach(() => {
      prismaMock.apprenant.findFirst.mockResolvedValue(apprenantMock);
      prismaMock.apprenant.update.mockResolvedValue({
        ...apprenantMock,
        nom: 'Nouveau nom',
      });
    });

    it('devrait modifier un apprenant', async () => {
      const dto = {
        nom: 'Nouveau nom',
      };

      const result = await service.update(apprenantId, dto, ecoleId);

      expect(prismaMock.apprenant.update).toHaveBeenCalledWith({
        where: {
          id: apprenantId,
        },
        data: {
          nom: 'Nouveau nom',
        },
        include: {
          user: true,
          apprenantparent: {
            include: {
              parent: true,
            },
          },
        },
      });

      expect(result).toEqual({
        ...apprenantMock,
        nom: 'Nouveau nom',
      });
    });

    it('devrait modifier plusieurs champs', async () => {
      const dto = {
        nom: 'Nouveau nom',
        prenoms: 'Nouveaux prénoms',
        Sexe: 'FEMININ' as const,
        dateNaissance: '2011-05-15',
        matricule: 'MAT-002',
      };

      prismaMock.apprenant.findFirst
        .mockResolvedValueOnce(apprenantMock)
        .mockResolvedValueOnce(null);

      await service.update(apprenantId, dto, ecoleId);

      expect(prismaMock.apprenant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            nom: 'Nouveau nom',
            prenoms: 'Nouveaux prénoms',
            Sexe: 'FEMININ',
            dateNaissance: new Date('2011-05-15'),
            matricule: 'MAT-002',
          },
        }),
      );
    });

    it('devrait vérifier le doublon de matricule', async () => {
      prismaMock.apprenant.findFirst
        .mockResolvedValueOnce(apprenantMock)
        .mockResolvedValueOnce({
          id: 'autre-apprenant',
          matricule: 'MAT-002',
        });

      await expect(
        service.update(apprenantId, { matricule: 'MAT-002' }, ecoleId),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.apprenant.update).not.toHaveBeenCalled();
    });

    it('ne devrait pas lever de conflit si le matricule est libre', async () => {
      prismaMock.apprenant.findFirst
        .mockResolvedValueOnce(apprenantMock)
        .mockResolvedValueOnce(null);

      await service.update(apprenantId, { matricule: 'MAT-002' }, ecoleId);

      expect(prismaMock.apprenant.update).toHaveBeenCalled();
    });

    it("devrait vérifier le doublon d'email", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'autre-user',
        email: 'test@example.com',
      });

      await expect(
        service.update(apprenantId, { email: 'test@example.com' }, ecoleId),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.apprenant.update).not.toHaveBeenCalled();
    });

    it("ne devrait pas lever de conflit si l'email appartient au même utilisateur", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: apprenantMock.userId,
        email: 'test@example.com',
      });

      await service.update(apprenantId, { email: 'test@example.com' }, ecoleId);

      expect(prismaMock.apprenant.update).toHaveBeenCalled();
    });

    it("devrait lever NotFoundException si l'apprenant n'existe pas", async () => {
      prismaMock.apprenant.findFirst.mockResolvedValue(null);

      await expect(
        service.update(apprenantId, { nom: 'Test' }, ecoleId),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.apprenant.update).not.toHaveBeenCalled();
    });

    it('ne devrait pas inclure les champs undefined dans la mise à jour', async () => {
      await service.update(
        apprenantId,
        {
          nom: undefined,
          prenoms: 'John',
        },
        ecoleId,
      );

      expect(prismaMock.apprenant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            prenoms: 'John',
          },
        }),
      );
    });
  });

  // ============================================================
  // REMOVE
  // ============================================================

  describe('remove', () => {
    beforeEach(() => {
      prismaMock.apprenant.findFirst.mockResolvedValue(apprenantMock);
      prismaMock.apprenant.delete.mockResolvedValue(apprenantMock);
    });

    it('devrait supprimer un apprenant', async () => {
      const result = await service.remove(apprenantId, ecoleId);

      expect(prismaMock.apprenant.findFirst).toHaveBeenCalled();

      expect(prismaMock.apprenant.delete).toHaveBeenCalledWith({
        where: {
          id: apprenantId,
        },
      });

      expect(result).toEqual(apprenantMock);
    });

    it("devrait lever NotFoundException si l'apprenant n'existe pas", async () => {
      prismaMock.apprenant.findFirst.mockResolvedValue(null);

      await expect(service.remove(apprenantId, ecoleId)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.apprenant.delete).not.toHaveBeenCalled();
    });

    it("ne devrait pas supprimer un apprenant d'une autre école", async () => {
      prismaMock.apprenant.findFirst.mockResolvedValue(null);

      await expect(service.remove(apprenantId, 'autre-ecole')).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.apprenant.delete).not.toHaveBeenCalled();
    });
  });
});

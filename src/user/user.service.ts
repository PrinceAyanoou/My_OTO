import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  createClerkClient,
  ClerkClient,
  User as ClerkUser,
} from '@clerk/express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly clerkClient: ClerkClient;

  constructor(private readonly prisma: PrismaService) {
    // Initialisation sécurisée de Clerk
    if (!process.env.CLERK_SECRET_KEY) {
      this.logger.error(
        "CLERK_SECRET_KEY est manquante dans les variables d'environnement",
      );
    }
    this.clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
  }

  // Créer un utilisateur (Clerk + Prisma)
  async create(dto: CreateUserDto) {
    // Vérifier si l'email existe déjà en BDD local
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    let clerkUser: ClerkUser;
    try {
      //Créer l'utilisateur chez Clerk
      clerkUser = await this.clerkClient.users.createUser({
        emailAddress: [dto.email],
        firstName: dto.prenoms,
        lastName: dto.nom,
      });
    } catch (error) {
      this.logger.error(`Erreur création Clerk: ${(error as Error).message}`);
      throw new InternalServerErrorException(
        "Échec de la création de l'compte d'authentification",
      );
    }

    try {
      //Sauvegarder dans Prisma avec le clerkUserId
      return await this.prisma.user.create({
        data: {
          ...dto,
          clerkUserId: clerkUser.id, // On associe l'ID émis par Clerk
        },
      });
    } catch (dbError) {
      // Rollback : Si Prisma échoue, on nettoie le compte créé sur Clerk
      await this.clerkClient.users.deleteUser(clerkUser.id);
      throw dbError;
    }
  }

  // Lister les utilisateurs par parent/employe/apprenant
  async findAll(filters: FilterUserDto) {
    const { type, search } = filters;

    // Construction dynamique de la clause WHERE pour Prisma
    const where: Prisma.userWhereInput = {};

    // Filtrage par type de profil (Apprenant, Employé, Parent)
    if (type === 'APPRENANT') {
      where.apprenant = { isNot: null }; // L'utilisateur a une relation apprenant liée
    } else if (type === 'EMPLOYE') {
      where.employe = { isNot: null };
    } else if (type === 'PARENT') {
      where.parent = { isNot: null };
    }

    // Recherche textuelle dans le nom, prénom ou email
    if (search) {
      where.OR = [
        { nom: { contains: search } },
        { prenoms: { contains: search } },
        { email: { contains: search } },
      ];
    }

    // Exécution de la requête Prisma
    return this.prisma.user.findMany({
      where,
      include: {
        apprenant: true,
        employe: true,
        parent: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Obtenir un utilisateur par son ID de BDD local
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        apprenant: true,
        employe: true,
        parent: true,
        ecole: true,
      },
    });

    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  // Obtenir le profil via le Clerk ID (JWT)
  async findByClerkId(clerkUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        apprenant: true,
        employe: true,
        parent: true,
      },
    });

    if (!user) throw new NotFoundException('Profil utilisateur non trouvé');
    return user;
  }

  //Mettre à jour l'utilisateur (Prisma + Sync Clerk)
  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    // Synchronisation avec Clerk si nom ou prénom modifiés
    if (dto.nom || dto.prenoms) {
      try {
        await this.clerkClient.users.updateUser(user.clerkUserId, {
          firstName: dto.prenoms ?? undefined,
          lastName: dto.nom ?? undefined,
        });
      } catch (error) {
        this.logger.warn(
          `Impossible de synchroniser avec Clerk pour l'utilisateur ${id}: ${(error as Error).message}`,
        );
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  // Supprimer un utilisateur
  async remove(id: string) {
    const user = await this.findOne(id);

    // Suppression dans la BDD Prisma en premier (pour vérifier les contraintes d'intégrité)
    const deletedUser = await this.prisma.user.delete({
      where: { id },
    });

    // Suppression dans Clerk ensuite
    try {
      await this.clerkClient.users.deleteUser(user.clerkUserId);
    } catch (e) {
      this.logger.warn(
        `Utilisateur ${user.clerkUserId} déjà supprimé de Clerk ou introuvable.`,
      );
      console.log(e);
    }

    return deletedUser;
  }
}

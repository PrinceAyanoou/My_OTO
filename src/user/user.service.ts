import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createClerkClient, ClerkClient } from '@clerk/express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { Prisma } from 'src/generated/prisma/client';

export interface CreateOrUpdateClerkUserDto {
  clerkUserId: string;
  email: string;
  nom: string;
  prenoms: string;
  telephone: string;
}
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

  // Créer un utilisateur (Prisma)
  async createUser(dto: CreateUserDto) {
    // Vérifier si l'email existe déjà en BDD local
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // let clerkUser: ClerkUser;
    // try {
    //   //Créer l'utilisateur chez Clerk
    //   clerkUser = await this.clerkClient.users.createUser({
    //     emailAddress: [dto.email],
    //     firstName: dto.prenoms,
    //     lastName: dto.nom,
    //   });
    // } catch (error) {
    //   this.logger.error(`Erreur création Clerk: ${(error as Error).message}`);
    //   throw new InternalServerErrorException(
    //     "Échec de la création de l'compte d'authentification",
    //   );
    // }

    try {
      //Sauvegarder dans Prisma avec le clerkUserId
      await this.prisma.user.create({
        data: {
          ...dto, //l'id clerk est déjà contenu dans la réponse reçu.
        },
      });
      return true;
    } catch (dbError) {
      // Rollback : Si Prisma échoue, on nettoie le compte créé sur Clerk
      throw new BadRequestException(
        `Impossible de créer l'utilisateur : ${dbError}`,
      );
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

  // Met à jour l'email local de l'utilisateur lié à Clerk
  async updateUserEmailByClerkId(clerkUserId: string, email: string) {
    await this.prisma.user.update({
      where: { clerkUserId },
      data: { email },
    });
  }

  // Supprime l'utilisateur local lié à Clerk
  async deleteUserByClerkId(clerkUserId: string) {
    await this.prisma.user.delete({
      where: { clerkUserId },
    });
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

  async createOrUpdateFromClerk(data: CreateOrUpdateClerkUserDto) {
    return this.prisma.user.upsert({
      where: {
        clerkUserId: data.clerkUserId, // Vérifie si cet ID Clerk existe déjà
      },
      update: {
        // En cas de mise à jour (ex: l'utilisateur modifie son nom sur Clerk)
        email: data.email,
        nom: data.nom,
        prenoms: data.prenoms,
        telephone: data.telephone,
      },
      create: {
        // En cas de création
        clerkUserId: data.clerkUserId,
        email: data.email,
        nom: data.nom,
        prenoms: data.prenoms,
        telephone: data.telephone,
        statut: 'ACTIF', // Définissez la valeur par défaut requise par votre schéma Prisma
      },
    });
  }
}

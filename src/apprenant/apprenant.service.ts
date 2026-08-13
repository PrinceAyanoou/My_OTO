// import {
//   Injectable,
//   NotFoundException,
//   ConflictException,
//   InternalServerErrorException,
//   BadRequestException,
// } from '@nestjs/common';
// import { createClerkClient, User as ClerkUser } from '@clerk/backend';
// import { PrismaService } from '../prisma/prisma.service';
// import * as crypto from 'crypto';
// import {
//   CreateApprenantDto,
//   UpdateApprenantDto,
//   QueryApprenantDto,
// } from './dto/apprenant.dto';
// import { Prisma } from '../generated/prisma';

// @Injectable()
// export class ApprenantService {
//   private clerkClient = createClerkClient({
//     secretKey: process.env.CLERK_SECRET_KEY,
//   });

//   constructor(private readonly prisma: PrismaService) {}

//   //Génère un matricule unique (ex: APP-2026-A1B2C3)
//   private generateMatricule(): string {
//     const year = new Date().getFullYear();
//     const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
//     return `APP-${year}-${randomHex}`;
//   }

//   //Création d'un apprenant (+ compte User/Clerk optionnel + liaisons parents)
//   async create(dto: CreateApprenantDto) {
//     let clerkUser: ClerkUser | null = null;
//     let userId: string | undefined = undefined;

//     // Gestion de la création du compte utilisateur si demandée
//     if (dto.createUserAccount) {
//       if (!dto.email || !dto.telephone) {
//         throw new BadRequestException(
//           "L'email et le téléphone sont requis pour créer un compte utilisateur.",
//         );
//       }

//       const existingUser = await this.prisma.user.findUnique({
//         where: { email: dto.email },
//       });
//       if (existingUser) {
//         throw new ConflictException(
//           `Un utilisateur avec l'email ${dto.email} existe déjà.`,
//         );
//       }

//       const tempPassword = `P@ss-${crypto.randomBytes(4).toString('hex')}-${Math.floor(1000 + Math.random() * 9000)}`;

//       try {
//         clerkUser = await this.clerkClient.users.createUser({
//           emailAddress: [dto.email],
//           firstName: dto.prenoms,
//           lastName: dto.nom,
//           password: tempPassword,
//           skipPasswordRequirement: false,
//         });
//       } catch (error) {
//         throw new InternalServerErrorException(
//           `Erreur lors de la création du compte Clerk: ${error}`,
//         );
//       }
//     }

//     try {
//       // 2. Générer un matricule unique non existant en base
//       let matricule = this.generateMatricule();
//       let exists = await this.prisma.apprenant.findUnique({
//         where: { matricule },
//       });
//       while (exists) {
//         matricule = this.generateMatricule();
//         exists = await this.prisma.apprenant.findUnique({
//           where: { matricule },
//         });
//       }

//       // 3. Transaction Prisma : User (si besoin) + Apprenant + Liaisons Parents
//       const result = await this.prisma.$transaction(async (tx) => {
//         if (clerkUser && dto.email && dto.telephone) {
//           const user = await tx.user.create({
//             data: {
//               clerkUserId: clerkUser.id,
//               nom: dto.nom,
//               prenoms: dto.prenoms,
//               email: dto.email,
//               telephone: dto.telephone,
//               statut: 'DOIT_MODIFIER_MDP',
//             },
//           });
//           userId = user.id;
//         }

//         const apprenant = await tx.apprenant.create({
//           data: {
//             matricule,
//             nom: dto.nom,
//             prenoms: dto.prenoms,
//             Sexe: dto.sexe,
//             dateNaissance: dto.dateNaissance,
//             userId,
//             apprenantparent: dto.parents?.length
//               ? {
//                   create: dto.parents.map((p) => ({
//                     parentId: p.parentId,
//                     lien: p.lien,
//                   })),
//                 }
//               : undefined,
//           },
//           include: {
//             user: true,
//             apprenantparent: {
//               include: {
//                 parent: {
//                   include: { user: true },
//                 },
//               },
//             },
//           },
//         });

//         return apprenant;
//       });

//       return result;
//     } catch (error) {
//       // Rollback du compte Clerk si la transaction Prisma échoue
//       if (clerkUser) {
//         await this.clerkClient.users.deleteUser(clerkUser.id);
//       }
//       throw error;
//     }
//   }

//   /**
//    * Recherche paginée des apprenants avec filtres
//    */
//   async findAll(query: QueryApprenantDto) {
//     const { page, limit, search, sexe, classeId, anneeScolaireId } = query;
//     const skip = (page - 1) * limit;

//     const whereConditions: Prisma.ApprenantWhereInput[] = [];

//     if (sexe) {
//       whereConditions.push({ Sexe: sexe });
//     }

//     if (search) {
//       whereConditions.push({
//         OR: [
//           { nom: { contains: search } },
//           { prenoms: { contains: search } },
//           { matricule: { contains: search } },
//         ],
//       });
//     }

//     if (classeId || anneeScolaireId) {
//       whereConditions.push({
//         inscriptions: {
//           some: {
//             ...(classeId && { classeScolaireId: classeId }),
//             ...(anneeScolaireId && { anneeScolaireId }),
//           },
//         },
//       });
//     }

//     const where: Prisma.ApprenantWhereInput =
//       whereConditions.length > 0 ? { AND: whereConditions } : {};

//     const [total, data] = await Promise.all([
//       this.prisma.apprenant.count({ where }),
//       this.prisma.apprenant.findMany({
//         where,
//         skip,
//         take: limit,
//         include: {
//           user: true,
//           apprenantparent: {
//             include: {
//               parent: {
//                 include: { user: true },
//               },
//             },
//           },
//           inscription: {
//             include: {
//               classscolaire: true,
//               anneescolaire: true,
//             },
//           },
//         },
//         orderBy: { createdAt: 'desc' },
//       }),
//     ]);

//     return {
//       data,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   }

//   /**
//    * Récupération d'un apprenant par son ID
//    */
//   async findOne(id: string) {
//     const apprenant = await this.prisma.apprenant.findUnique({
//       where: { id },
//       include: {
//         user: true,
//         apprenantparent: {
//           include: {
//             parent: {
//               include: { user: true },
//             },
//           },
//         },
//         inscription: {
//           include: {
//             classscolaire: true,
//             anneescolaire: true,
//             dossierscolarite: true,
//           },
//         },
//       },
//     });

//     if (!apprenant) {
//       throw new NotFoundException(`Apprenant avec l'ID '${id}' introuvable.`);
//     }

//     return apprenant;
//   }

//   /**
//    * Récupération d'un apprenant par son matricule
//    */
//   async findByMatricule(matricule: string) {
//     const apprenant = await this.prisma.apprenant.findUnique({
//       where: { matricule },
//       include: {
//         user: true,
//         apprenantparent: {
//           include: {
//             parent: {
//               include: { user: true },
//             },
//           },
//         },
//         inscription: {
//           include: {
//             classscolaire: true,
//             anneescolaire: true,
//           },
//         },
//       },
//     });

//     if (!apprenant) {
//       throw new NotFoundException(
//         `Apprenant avec le matricule '${matricule}' introuvable.`,
//       );
//     }

//     return apprenant;
//   }

//   /**
//    * Mise à jour des informations de l'apprenant
//    */
//   async update(id: string, dto: UpdateApprenantDto) {
//     await this.findOne(id);

//     return this.prisma.apprenant.update({
//       where: { id },
//       data: {
//         ...(dto.nom && { nom: dto.nom }),
//         ...(dto.prenoms && { prenoms: dto.prenoms }),
//         ...(dto.sexe && { Sexe: dto.sexe }),
//         ...(dto.dateNaissance && { dateNaissance: dto.dateNaissance }),
//       },
//       include: {
//         user: true,
//         apprenantparent: {
//           include: {
//             parent: {
//               include: { user: true },
//             },
//           },
//         },
//       },
//     });
//   }

//   /**
//    * Suppression d'un apprenant
//    */
//   async remove(id: string) {
//     const apprenant = await this.findOne(id);

//     return this.prisma.apprenant.delete({
//       where: { id: apprenant.id },
//     });
//   }
// }

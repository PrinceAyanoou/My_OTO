import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  CaslAbilityFactory,
  UserContext,
} from '../casl/casl-ability.factory/casl-ability.factory';
import {
  CHECK_POLICIES_KEY,
  PermissionHandler,
} from '../decorators/check-permissions.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  permission_action,
  permission_cible,
} from 'src/generated/prisma/client';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    clerkUserId: string;
  };
  ability?: any;
}

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissionsHandlers =
      this.reflector.getAllAndMerge<PermissionHandler[]>(CHECK_POLICIES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    // S'il n'y a pas de permission requise sur le contrôleur et la route, on autorise l'accès
    if (permissionsHandlers.length === 0) return true;

    //on réupère la requête utilisateur et on la transforme en http pour extraire l'utilisateur
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const clerkUser = request.user;

    // Extraire l'ecoleId depuis le header, les params ou le query
    const ecoleId =
      (request.headers['x-ecole-id'] as string) ||
      (request.params.ecoleId as string) ||
      (request.query.ecoleId as string);

    //si le user n'a pas pu être extrait
    if (!clerkUser) {
      throw new UnauthorizedException('Utilisateur non authentifié.');
    }

    // Interroger directement la VUE SQL pour obtenir un user.
    const orFilters = ecoleId
      ? [{ ecoleId }, { ecoleId: '' }]
      : [{ ecoleId: '' }];

    const userPermissions = await this.prisma.userAuthorizationContext.findMany(
      {
        where: {
          clerkUserId: clerkUser.clerkUserId,
          OR: orFilters,
        },
      },
    );

    //si le user n'a aucune permission, on lève une exception.
    if (userPermissions.length === 0) {
      throw new ForbiddenException(
        'Aucune autorisation trouvée pour cet utilisateur dans cette école.',
      );
    }

    //On vérifie si c'est un parent
    const isParent = userPermissions.some(
      (p) => p.typeUtilisateur === 'PARENT',
    );
    //on vérifie si c'est un apprenant
    const isApprenant = userPermissions.some(
      (p) => p.typeUtilisateur === 'APPRENANT',
    );

    //on met dans un map l'employe et ses différntes permissions
    const employeRolesMap = new Map<
      string,
      Array<{ action: permission_action; cible: permission_cible }>
    >();
    //on parcours les permissions
    for (const permission of userPermissions) {
      //si l'employe existe, et ces actions et cibles aussi alors il regroupe les actions et cibles autorisées par ecoleId.
      if (
        permission.typeUtilisateur === 'EMPLOYE' &&
        permission.action &&
        permission.cible
      ) {
        const roleEcoleId = permission.ecoleId || '';
        const current = employeRolesMap.get(roleEcoleId) ?? [];
        current.push({
          action: permission.action,
          cible: permission.cible,
        });
        employeRolesMap.set(roleEcoleId, current);
      }
    }

    const employeRoles = Array.from(employeRolesMap.entries()).map(
      ([roleEcoleId, permissions]) => ({
        ecoleId: roleEcoleId,
        permissions,
      }),
    );

    const userContext: UserContext = {
      id: userPermissions[0].userId,
      clerkUserId: userPermissions[0].clerkUserId,
      ...(employeRoles.length > 0 ? { employe: { roles: employeRoles } } : {}),
      ...(isParent ? { parent: { id: userPermissions[0].userId } } : {}),
      ...(isApprenant ? { apprenant: { id: userPermissions[0].userId } } : {}),
    };

    // Créer l'ability CASL
    const ability = this.caslAbilityFactory.createForUser(userContext, ecoleId);

    // Évaluer les politiques déclarées sur le contrôleur/endpoint
    const isAllowed = permissionsHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );

    if (!isAllowed) {
      throw new ForbiddenException(
        "Vous n'avez pas les droits nécessaires pour effectuer cette action.",
      );
    }

    // On attache l'ability à la requête pour pouvoir l'utiliser dans le contrôleur si besoin
    request.ability = ability;

    return true;
  }

  private execPolicyHandler(handler: PermissionHandler, ability: any): boolean {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}

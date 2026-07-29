import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { verifyToken } from '@clerk/express';
import { Request } from 'express';

//définissons une interface qui étend de Request afin d'ajouter user
interface VerifyUser extends Request {
  user?: Awaited<ReturnType<typeof verifyToken>>;
}
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<VerifyUser>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant ou format invalide');
    }

    // Extraction propre du token (évite les espaces multiples)
    const token = authHeader.split(/\s+/)[1];

    if (!process.env.CLERK_SECRET_KEY) {
      this.logger.error(
        "CLERK_SECRET_KEY n'est pas définie dans l'environnement",
      );
      throw new UnauthorizedException('Erreur de configuration serveur');
    }

    try {
      const decoded = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      // Injection des données utilisateur dans la requête
      request.user = decoded;
      return true;
    } catch (error) {
      // Logger l'erreur réelle pour faciliter le debug
      this.logger.warn(
        `Échec de vérification du token Clerk : ${(error as Error).message}`,
      );
      throw new UnauthorizedException('Token Clerk invalide ou expiré');
    }
  }
}

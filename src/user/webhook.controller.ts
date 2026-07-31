import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Webhook } from 'svix';
import type { Request } from 'express';
import { UsersService } from './user.service'; // Adaptez le chemin selon votre structure
import type { WebhookEvent } from '@clerk/express';

interface RequestWithRawBody extends Request {
  rawBody?: Buffer;
}
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly usersService: UsersService) {}

  @Post('clerk')
  async handleClerkWebhook(
    @Req() req: Request,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    const secret = process.env.CLERK_WEBHOOK_SECRET;

    if (!secret) {
      console.error(
        "CLERK_WEBHOOK_SECRET n'est pas défini dans le fichier .env",
      );
      throw new InternalServerErrorException(
        'Configuration serveur incomplète',
      );
    }

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException('En-têtes Svix manquants');
    }

    // 1. Récupération du rawBody
    const rawBody = (req as RequestWithRawBody).rawBody;
    if (!rawBody) {
      console.error(
        ' rawBody introuvable ! Vérifiez que { rawBody: true } est activé dans main.ts',
      );
      throw new InternalServerErrorException(
        'Erreur de configuration NestJS (rawBody manquant)',
      );
    }

    const payload = rawBody.toString('utf8');

    // 2. Vérification de la signature
    const wh = new Webhook(secret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('❌ Échec de vérification de la signature Svix:', err);
      throw new BadRequestException('Signature Webhook invalide');
    }

    // 3. Traitement de l'événement
    const eventType = evt.type;

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, phone_numbers } =
        evt.data;
      const primaryEmail = email_addresses?.[0]?.email_address;

      if (!primaryEmail) {
        throw new BadRequestException(
          'Aucun email associé à cet utilisateur Clerk',
        );
      }

      try {
        await this.usersService.createOrUpdateFromClerk({
          clerkUserId: id,
          email: primaryEmail,
          nom: last_name || 'Non renseigné',
          prenoms: first_name || 'Non renseigné',
          telephone: phone_numbers?.[0]?.phone_number || '',
        });

        console.log(`✅ Utilisateur synchro Prisma avec succès : ${id}`);
      } catch (dbError) {
        console.error("❌ Erreur lors de l'insertion Prisma :", dbError);
        throw new InternalServerErrorException(
          "Échec d'enregistrement en base de données",
        );
      }
    }

    return { success: true };
  }
}

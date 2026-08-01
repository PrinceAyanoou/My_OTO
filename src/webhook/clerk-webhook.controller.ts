import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
  InternalServerErrorException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Webhook } from 'svix';
import { Request } from 'express';
import { UsersService } from '../user/user.service';
import type { WebhookEvent } from '@clerk/express';

@Controller('webhooks/clerk')
export class ClerkWebhookController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new InternalServerErrorException(
        'CLERK_WEBHOOK_SECRET manquant dans les variables d’environnement.',
      );
    }

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException('En-têtes Svix manquants.');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new InternalServerErrorException(
        'rawBody introuvable. Vérifie que { rawBody: true } est activé dans main.ts.',
      );
    }

    const webhook = new Webhook(webhookSecret);
    let payload: WebhookEvent;
    try {
      payload = webhook.verify(rawBody.toString('utf8'), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEvent;
    } catch {
      throw new BadRequestException('Signature de webhook invalide.');
    }

    const eventType = payload.type;
    const eventData = payload.data;

    if (eventType === 'user.created' || eventType === 'user.updated') {
      if (typeof eventData === 'object' && eventData !== null) {
        const maybeClerkUser = eventData as {
          id?: unknown;
          email_addresses?: unknown;
          primary_email_address_id?: unknown;
        };

        if (
          typeof maybeClerkUser.id === 'string' &&
          Array.isArray(maybeClerkUser.email_addresses) &&
          typeof maybeClerkUser.primary_email_address_id === 'string'
        ) {
          const emailAddresses = maybeClerkUser.email_addresses as Array<{
            id: string;
            email_address: string;
          }>;
          const primaryEmail = emailAddresses.find(
            (email) => email.id === maybeClerkUser.primary_email_address_id,
          )?.email_address;

          if (typeof primaryEmail === 'string') {
            await this.usersService.updateUserEmailByClerkId(
              maybeClerkUser.id,
              primaryEmail,
            );
          }
        }
      }
    }

    if (eventType === 'user.deleted') {
      if (typeof eventData === 'object' && eventData !== null) {
        const maybeDeleted = eventData as { id?: unknown };
        if (typeof maybeDeleted.id === 'string') {
          await this.usersService.deleteUserByClerkId(maybeDeleted.id);
        }
      }
    }

    return { success: true };
  }
}

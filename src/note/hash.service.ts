import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class StudentTokenService {
  private readonly secretKey =
    process.env.EXCEL_HASH_SECRET || 'votre_cle_secrete_32_caracteres_min';

  private readonly algorithm = 'aes-256-cbc';

  encodeId(inscriptionId: string): string {
    // AES-CBC utilise un IV de 16 octets
    const iv = crypto.randomBytes(16);

    // AES-256 nécessite une clé de 32 octets
    const key = crypto.scryptSync(this.secretKey, 'salt', 32);

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(inscriptionId, 'utf8', 'hex');

    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}-${encrypted}`;
  }

  decodeId(token: string): string {
    try {
      const [ivHex, encryptedHex] = token.split('-');

      if (!ivHex || !encryptedHex) {
        throw new Error('Token invalide');
      }

      const iv = Buffer.from(ivHex, 'hex');

      if (iv.length !== 16) {
        throw new Error('IV invalide');
      }

      const key = crypto.scryptSync(this.secretKey, 'salt', 32);

      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');

      decrypted += decipher.final('utf8');

      return decrypted;
    } catch {
      throw new BadRequestException(
        `Le code élève fourni ("${token}") est invalide ou altéré.`,
      );
    }
  }
}

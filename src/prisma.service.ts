import { Injectable } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaMariaDb({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'v1',
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({ adapter });
  }
}

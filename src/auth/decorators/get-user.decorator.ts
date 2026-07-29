import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { verifyToken } from '@clerk/express';

interface VerifyUser extends Request {
  user?: Awaited<ReturnType<typeof verifyToken>>;
}
export const GetClerkUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<VerifyUser>();
    return request.user; // Contient le payload décodé de Clerk (sub = clerkUserId)
  },
);

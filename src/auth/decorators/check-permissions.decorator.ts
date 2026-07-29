import { SetMetadata } from '@nestjs/common';
import { AppAbility } from '../casl/casl-ability.factory/casl-ability.factory';

export interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PermissionHandler = IPolicyHandler | PolicyHandlerCallback;

export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PermissionHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);

import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: { rol: string, modulo: string }[]) => SetMetadata(ROLES_KEY, roles);

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';


@Injectable()
export class RolesGuard implements CanActivate {
constructor(private reflector: Reflector) {}


canActivate(context: ExecutionContext): boolean {
const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
context.getHandler(),
context.getClass(),
]);
if (!requiredRoles) return true; // sem restrição


const req = context.switchToHttp().getRequest();
const user = req.user; // JWTStrategy deve popular req.user
if (!user) return false;


// user pode ter user.accountType ou user.userId -> buscar no DB se necessário
const role = user.accountType ?? user.role ?? user.userType;
return requiredRoles.includes(role);
}
}
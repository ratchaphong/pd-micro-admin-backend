import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: import('@nestjs/common').ExecutionContext) {
    console.log('🛡 JwtAuthGuard activated');
    return super.canActivate(context);
  }
}

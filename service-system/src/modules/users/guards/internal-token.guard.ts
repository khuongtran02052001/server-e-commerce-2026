import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class InternalTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const got = req.headers['x-internal-token'];
    const want = process.env.INTERNAL_TOKEN;
    if (!want) return true; // dev: nếu chưa set thì cho qua (tuỳ bạn)
    if (got !== want) throw new UnauthorizedException('Invalid internal token');
    return true;
  }
}

import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClientKeyGuard implements CanActivate {
  private readonly allowedKeys: string[];

  constructor(configService: ConfigService) {
    const allowedKeysStr = configService.getOrThrow('allowed-client-keys') as string;
    this.allowedKeys = allowedKeysStr.split(',').map(k => k.trim());
  }

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const request = context.switchToHttp().getRequest();
    const clientKey = request.headers['x-client-key'] as string | undefined;
    if (clientKey == null || !this.allowedKeys.includes(clientKey)) {
      throw new HttpException('Forbidden: invalid client key', HttpStatus.FORBIDDEN);
    }
    return true;
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly adminService: AdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessHash = request.headers['x-admin-hash'] || request.body?.accessHash || request.query?.accessHash;

    if (!accessHash) {
      throw new UnauthorizedException('Admin access hash is required. Please provide it in the X-Admin-Hash header, query parameter, or request body.');
    }

    const isValid = await this.adminService.validateAccessHash(accessHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid admin access hash.');
    }

    return true;
  }
}


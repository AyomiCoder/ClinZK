import { UseGuards, applyDecorators } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';

export function AdminAccess() {
  return applyDecorators(UseGuards(AdminGuard));
}


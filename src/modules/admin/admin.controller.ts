import { Controller, Post, Body, Get, HttpCode, HttpStatus, Delete, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminAccess } from './decorators/admin.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('generate-hash')
  @HttpCode(HttpStatus.CREATED)
  async generateAccessHash(@Body() body?: { description?: string }) {
    const adminHash = await this.adminService.createAccessHash(body?.description);
    return {
      accessHash: adminHash.hash,
      id: adminHash.id,
      description: adminHash.description,
      createdAt: adminHash.createdAt,
      message: 'Save this hash securely. Use it to access admin endpoints.',
    };
  }

  @Post('verify-hash')
  @HttpCode(HttpStatus.OK)
  async verifyAccessHash(@Body() body: { accessHash: string }) {
    const isValid = await this.adminService.validateAccessHash(body.accessHash);
    return {
      valid: isValid,
      message: isValid ? 'Access hash is valid' : 'Access hash is invalid',
    };
  }

  @Get('hashes')
  @AdminAccess()
  async getAllHashes() {
    const hashes = await this.adminService.getAllHashes();
    return hashes.map((h) => ({
      id: h.id,
      hash: h.hash,
      description: h.description,
      isActive: h.isActive,
      createdAt: h.createdAt,
    }));
  }

  @Delete('hashes/:hash')
  @AdminAccess()
  @HttpCode(HttpStatus.OK)
  async deactivateHash(@Param('hash') hash: string) {
    await this.adminService.deactivateHash(hash);
    return {
      message: 'Access hash deactivated successfully',
      hash,
    };
  }
}


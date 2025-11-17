import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { AdminHash } from './entities/admin-hash.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminHash)
    private adminHashRepository: Repository<AdminHash>,
  ) {}

  generateAccessHash(): string {
    return crypto.randomBytes(8).toString('hex').substring(0, 16);
  }

  async createAccessHash(description?: string): Promise<AdminHash> {
    let hash: string;
    let exists = true;

    while (exists) {
      hash = this.generateAccessHash();
      const existing = await this.adminHashRepository.findOne({
        where: { hash },
      });
      exists = !!existing;
    }

    const adminHash = this.adminHashRepository.create({
      hash: hash!,
      description: description || null,
      isActive: true,
    });

    return await this.adminHashRepository.save(adminHash);
  }

  async validateAccessHash(hash: string): Promise<boolean> {
    const adminHash = await this.adminHashRepository.findOne({
      where: { hash, isActive: true },
    });
    return !!adminHash;
  }

  async getAllHashes(): Promise<AdminHash[]> {
    return await this.adminHashRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async deactivateHash(hash: string): Promise<void> {
    const adminHash = await this.adminHashRepository.findOne({
      where: { hash },
    });

    if (adminHash) {
      adminHash.isActive = false;
      await this.adminHashRepository.save(adminHash);
    }
  }
}


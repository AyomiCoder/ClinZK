import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface TrialRequirements {
  minAge?: number;
  maxAge?: number;
  genders?: string[];
  bloodGroups?: string[];
  genotypes?: string[];
  conditions?: string[];
}

@Entity('trials')
export class Trial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  codeName: string;

  @Column({ type: 'varchar' })
  displayName: string;

  @Column({ type: 'jsonb' })
  requirements: TrialRequirements;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


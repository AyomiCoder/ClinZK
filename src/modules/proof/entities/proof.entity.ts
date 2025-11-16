import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { PROOF_STATUS } from '../../../common/constants';

@Entity('proofs')
@Index(['proofHash'])
@Index(['nullifier'])
export class Proof {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  proofHash: string;

  @Column({ type: 'varchar', unique: true })
  nullifier: string;

  @Column({ type: 'varchar' })
  issuerDid: string;

  @Column({ type: 'varchar' })
  @Index()
  credentialHash: string;

  @Column({ type: 'varchar', nullable: true })
  trialId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  eligibleTrialIds: string[] | null;

  @Column({
    type: 'enum',
    enum: PROOF_STATUS,
    default: PROOF_STATUS.PENDING,
  })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  txHash: string | null;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


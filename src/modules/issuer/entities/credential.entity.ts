import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { CREDENTIAL_STATUS } from '../../../common/constants';

@Entity('credentials')
@Index(['issuerId', 'patientNumber'])
export class Credential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  credentialHash: string;

  @Column({ type: 'jsonb', nullable: true })
  credential: {
    issuer: string;
    claims: {
      name: string;
      age: number;
      gender: string;
      bloodGroup: string;
      genotype: string;
      conditions: string[];
    };
    issuedAt: string;
    expiry: string;
  } | null;

  @Column({ type: 'timestamp' })
  issuedAt: Date;

  @Column({ type: 'timestamp' })
  expiry: Date;

  @Column({ type: 'varchar' })
  issuerDid: string;

  @Column({ type: 'varchar' })
  issuerId: string;

  @Column({ type: 'varchar' })
  patientNumber: string;

  @Column({
    type: 'enum',
    enum: CREDENTIAL_STATUS,
    default: CREDENTIAL_STATUS.ACTIVE,
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


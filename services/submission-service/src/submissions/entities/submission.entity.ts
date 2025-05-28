import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  assignmentId: string;

  @Column()
  userId: string;

  @Column()
  filename: string;

  @Column()
  fileSize: number;

  @Column({ default: 'INIT' })
  status: 'INIT' | 'VALIDATED' | 'QUEUED' | 'GRADED' | 'FAILED';

  @Column({ nullable: true })
  resultScore: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  file?: string;

  @Column({ type: 'text', nullable: true })
  metadata?: string;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'int' })
  task_id: number;

  @Column({
    type: 'decimal',
    precision: 9,
    scale: 3,
    nullable: true,
  })
  point?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ type: 'boolean', default: false })
  marked_for_grading: boolean;
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';
import { Repository } from 'typeorm';
import { S3Service } from '../storage/s3.service';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private submissionsRepo: Repository<Submission>,
    private s3Service: S3Service,
  ) {}

  /**
   * Creates a new submission for a user and assignment.
   * @param userId - The ID of the user making the submission.
   * @param assignmentId - The ID of the assignment being submitted.
   * @param filename - The name of the file being submitted.
   * @param fileSize - The size of the file being submitted.
   * @returns The created Submission entity.
   */
  async createSubmission(
    userId: string,
    assignmentId: string,
    filename: string,
    fileSize: number,
  ): Promise<Submission> {
    const submission = this.submissionsRepo.create({
      userId,
      assignmentId,
      filename,
      fileSize,
      status: 'INIT',
    });

    return await this.submissionsRepo.save(submission);
  }

  /**
   * Finds a submission by its ID.
   * @param id - The ID of the submission to find.
   * @returns The found Submission entity.
   * @throws NotFoundException if the submission does not exist.
   */
  async findOneById(id: string): Promise<Submission> {
    const submission = await this.submissionsRepo.findOneBy({ id });
    if (!submission) {
      throw new NotFoundException();
    }

    return submission;
  }

  /**
   * Finds all submissions for a specific assignment and user.
   * @param assignmentId - The ID of the assignment.
   * @param userId - The ID of the user.
   * @returns An array of Submission entities.
   */
  async findByAssignment(
    assignmentId: string,
    userId: string,
  ): Promise<Submission[]> {
    return this.submissionsRepo.find({
      where: { assignmentId, userId },
      order: { createdAt: 'DESC' },
    });
  }

  async completeSubmission(id: string): Promise<Submission> {
    const submission = await this.submissionsRepo.findOneBy({ id });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    submission.status = 'VALIDATED';
    return await this.submissionsRepo.save(submission);
  }

  /**
   * Updates the status of a submission.
   * @param id - The ID of the submission to update.
   * @param status - The new status to set.
   */
  async updateStatus(id: string, status: Submission['status']): Promise<void> {
    await this.submissionsRepo.update(id, {
      status,
      updatedAt: new Date(),
    });
  }

  async getUploadUrl(filename: string): Promise<string> {
    const key = `submissions/${filename}`;
    return this.s3Service.getSignedUploadUrl(key);
  }
}

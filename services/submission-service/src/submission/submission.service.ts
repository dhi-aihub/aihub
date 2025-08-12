import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { EnqueueClient } from '../jobs/enqueue.client';
import { Submission } from './submission.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
    private dataSource: DataSource,
    private enqueue: EnqueueClient,
  ) {}

  /**
   * Create a new submission.
   * @param dto - The data transfer object containing submission details
   * @param jwtUserId - The ID of the user making the submission
   * @returns The created submission
   */
  async create(
    dto: CreateSubmissionDto,
    jwtUserId: number,
  ): Promise<Submission> {
    // const today = new Date();
    // const { task_id } = dto;

    // TODO: No way to test whether there is a limit
    // const [{ daily_submission_limit }] = await this.dataSource.query(
    //   'SELECT daily_submission_limit FROM task WHERE id = $1',
    //   [task_id],
    // );

    // const count = await this.submissionRepository.count({
    //   where: {
    //     user_id: jwtUserId,
    //     created_at: In([
    //       this.beginOfDay(today).toISOString(),
    //       this.endOfDay(today).toISOString(),
    //     ]) as any,
    //   },
    // });

    // if (count >= daily_submission_limit)
    //   throw new ForbiddenException(
    //     'You have exceeded your daily submission limit.',
    //   );

    const sub = this.submissionRepository.create({
      ...dto,
      user_id: jwtUserId,
    });

    const saved = await this.submissionRepository.save(sub);

    const [taskRow] = await this.dataSource.query(
      `SELECT run_time_limit, ram_limit, vram_limit, eval_queue_name
       FROM task WHERE id = $1`,
      [saved.task_id],
    );

    await this.enqueue.enqueueJob({
      submission_id: saved.id,
      user_id: saved.user_id,
      task_id: saved.task_id,
      file_url: saved.file, // TODO: Set up an S3 system
      template_url: null,
      limits: {
        time: taskRow.run_time_limit,
        ram_mb: taskRow.ram_limit,
        vram_mb: taskRow.vram_limit,
      },
      queue: taskRow.eval_queue_name || 'default',
    });

    return saved;
  }

  /**
   * Find a submission by ID and return it with computed fields.
   * @param id - The ID of the submission to find
   * @returns The found submission with computed fields or null if not found
   */
  async findOneWithComputedFields(id: number) {
    const submission = await this.submissionRepository.findOne({
      where: { id },
    });

    if (!submission) return null;

    return {
      ...submission,
      filename: this.getFilename(submission.file),
      file_url: this.getFileUrl(
        submission.file,
        submission.task_id,
        submission.id,
      ),
      file_size: this.getFileSize(submission.file),
      info: this.extractInfo(submission.notes, submission.point),
      is_late: false, // TODO: Figure out how to determine if submission is late
    };
  }

  /**
   * Find all submissions for a user or those they can access as an admin.
   * @param user - The user object containing user details
   * @returns An array of submissions the user can access
   */
  async findManyForUser(user: any) {
    if (user.isStaff) {
      return this.submissionRepository.find();
    }

    // const adminCourseIds = await this.dataSource.query(
    //   `SELECT course_id
    //    FROM participation
    //    WHERE user_id = $1
    //      AND role = ANY ($2)`,
    //   [user.id, '{instructor,ta,coordinator}'], // Based on existing AiRENA roles
    // );

    return (
      this.submissionRepository
        .createQueryBuilder('s')
        .where('s.user_id = :uid', { uid: user.userId })
        // .orWhere(
        //   's.task_id IN (SELECT id FROM task WHERE course_id IN (:...cids))',
        //   {
        //     cids: adminCourseIds.map((r: any) => r.course_id),
        //   },
        // )
        .getMany()
    );
  }

  /**
   * Download a submission file by its ID.
   * @param id - The ID of the submission to download
   * @param user - The user object requesting the download
   * @returns An object containing file path, size, and filename
   */
  async download(id: number, user: any) {
    const sub = await this.submissionRepository.findOneBy({ id });

    if (!sub) {
      throw new NotFoundException();
    }

    const [{ course_id }] = await this.dataSource.query(
      `SELECT course_id FROM task WHERE id = $1`,
      [sub.task_id],
    );

    // TODO: Find way to check if user is allowed to download this submission
    // const allowed = await hasPerm(course_id, user, 'submission.download');
    // if (!allowed) {
    //   throw new ForbiddenException();
    // }

    return {
      filePath: sub.file,
      size: sub.file ? fs.statSync(sub.file).size : 0,
      filename: path.basename(sub.file ?? ''),
    };
  }

  /**
   * Mark a submission for grading.
   * @param id - The ID of the submission to mark
   * @param user - The user object requesting the marking
   */
  async markForGrading(id: number, user: any) {
    const sub = await this.submissionRepository.findOneBy({ id });
    if (!sub) throw new NotFoundException();

    const [{ course_id }] = await this.dataSource.query(
      `SELECT course_id FROM task WHERE id = $1`,
      [sub.task_id],
    );

    // TODO: Find way to check if user is allowed to mark this submission
    // const allowed =
    //   (await hasPerm(course_id, user, 'submission.mark')) ||
    //   user.id === sub.user_id;
    // if (!allowed) {
    //   throw new ForbiddenException();
    // }

    // Unmark other submissions for the same user and task
    await this.submissionRepository.update(
      { user_id: sub.user_id, task_id: sub.task_id },
      { marked_for_grading: false },
    );
    await this.submissionRepository.update(
      { id },
      { marked_for_grading: true },
    );
  }

  async rerun(id: number, user: any) {
    const sub = await this.submissionRepository.findOneBy({ id });
    if (!sub) throw new NotFoundException();

    const [{ course_id }] = await this.dataSource.query(
      `SELECT course_id FROM task WHERE id = $1`,
      [sub.task_id],
    );

    // TODO: Find way to check if user is allowed to rerun this submission
    // const allowed = await hasPerm(course_id, user, 'submission.rerun');
    // if (!allowed) {
    //   throw new ForbiddenException();
    // }

    // TODO: Implement Scheduler logic to mimic Django signal
    // await this.scheduler.createJobWithSubmission(sub);
  }

  /**
   * Extract the filename from a file path.
   * @param file - The file path to extract the filename from
   * @returns The extracted filename or null if not found
   */
  private getFilename(file?: string): string | null {
    return file ? path.basename(file) : null;
  }

  /**
   * Generate the file URL for a submission.
   * @param file - The file path of the submission
   * @param taskId - The ID of the task associated with the submission
   * @param id - The ID of the submission
   * @returns The generated file URL or null if any parameter is missing
   */
  private getFileUrl(
    file?: string,
    taskId?: number,
    id?: number,
  ): string | null {
    if (!file || !taskId || !id) return null;
    return `/submissions/download/${taskId}/${id}`;
  }

  /**
   * Get the size of a file.
   * @param file - The file path to get the size of
   * @returns The size of the file in bytes or null if not found
   */
  private getFileSize(file?: string): number | null {
    if (!file) return null;
    try {
      if (fs.existsSync(file)) {
        return fs.statSync(file).size;
      }
    } catch {
      return null;
    }
    return null;
  }

  /**
   * Extract relevant information from the submission notes.
   * @param notes - The notes from the submission
   * @param point - The point value of the submission
   * @returns The extracted information or the point value if not found
   */
  private extractInfo(notes?: string, point?: number): any {
    try {
      if (notes) {
        const cleanNotes = notes.replace(/\\n/g, ' ');
        const matches = cleanNotes.match(/(\w*(Error|Exception|error)\w*)/g);
        if (matches && matches.length > 0) {
          return matches[matches.length - 1];
        }
        const parsed = JSON.parse(notes);
        return parsed.error?.type;
      }
    } catch {
      return point;
    }

    return point;
  }

  /**
   * Get the beginning of the day for a given date.
   * @param d - The date to get the beginning of the day for
   * @returns The beginning of the day for the given date
   */
  private beginOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
  }

  /**
   * Get the end of the day for a given date.
   * @param d - The date to get the end of the day for
   * @returns The end of the day for the given date
   */
  private endOfDay(d: Date) {
    return new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      23,
      59,
      59,
      999,
    );
  }
}

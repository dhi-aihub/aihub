import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { Submission } from './submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Submission])],
  controllers: [SubmissionController],
  providers: [SubmissionService],
})
export class SubmissionModule {}

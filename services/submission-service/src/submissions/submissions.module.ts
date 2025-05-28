import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { S3Module } from 'src/storage/s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([Submission]), S3Module],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
})
export class SubmissionsModule {}

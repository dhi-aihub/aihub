import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { User } from '../common/decorators/user.decorator';
import { InitSubmissionDto } from './dtos/init-submission.dto';

@Controller('submissions')
// @UseGuards(JwtAuthGuard)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('/assignments/:assignmentId/init')
  async initSubmission(
    @Param('assignmentId') assignmentId: string,
    @User('userId') userId: string,
    @Body() dto: InitSubmissionDto,
  ) {
    const submission = await this.submissionsService.createSubmission(
      userId,
      assignmentId,
      dto.filename,
      dto.fileSize,
    );

    const uploadUrl = await this.submissionsService.getUploadUrl(
      submission.filename,
    );
    return { id: submission.id, uploadUrl };
  }

  @Put('/:id/complete')
  async complete(@Param('id') id: string) {
    const updated = await this.submissionsService.completeSubmission(id);
    if (!updated) throw new NotFoundException();
    return { status: 'queued' };
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    return this.submissionsService.findOneById(id);
  }

  @Get('/assignments/:assignmentId')
  async getByAssignment(
    @Param('assignmentId') assignmentId: string,
    @User('userId') userId: string,
  ) {
    return this.submissionsService.findByAssignment(assignmentId, userId);
  }
}

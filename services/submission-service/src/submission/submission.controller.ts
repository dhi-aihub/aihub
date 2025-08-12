import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@Controller('submission')
@UseGuards(JwtAuthGuard)
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async create(@Request() req: any, @Body() dto: CreateSubmissionDto) {
    return this.submissionService.create(dto, req.user.userId);
  }

  @Get()
  async list(@Request() req: any) {
    return this.submissionService.findManyForUser(req.user);
  }
}

import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateSubmissionDto {
  @IsInt()
  task_id: number;

  @IsString()
  file?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  metadata?: string;
}

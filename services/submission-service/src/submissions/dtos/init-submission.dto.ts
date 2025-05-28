import { IsString, IsNumber } from 'class-validator';

export class InitSubmissionDto {
  @IsString()
  filename: string;

  @IsNumber()
  fileSize: number;
}

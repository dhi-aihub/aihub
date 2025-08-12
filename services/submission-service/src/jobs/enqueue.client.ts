import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class EnqueueClient {
  constructor(private readonly http: HttpService) {}

  async enqueueJob(payload: {
    submission_id: number;
    user_id: number;
    task_id: number;
    file_url: string;
    template_url?: string | null;
    limits: { time: number; ram_mb: number; vram_mb: number };
    queue: string;
  }) {
    const url = `${process.env.ENQUEUE_URL}/jobs`;
    await this.http.axiosRef.post(url, payload);
  }
}

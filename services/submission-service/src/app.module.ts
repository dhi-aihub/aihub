import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubmissionsController } from './submissions/submissions.controller';
import { SubmissionsModule } from './submissions/submissions.module';

@Module({
  imports: [SubmissionsModule],
  controllers: [AppController, SubmissionsController],
  providers: [AppService],
})
export class AppModule {}

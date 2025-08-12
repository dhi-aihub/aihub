import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubmissionModule } from './submission/submission.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 55432,
      username: 'admin',
      password: 'secret',
      database: 'submission_db',
      autoLoadEntities: true,
      synchronize: true, // Deployment only, set false in production
    }),
    HttpModule.register({ timeout: 3000 }),
    AuthModule,
    SubmissionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

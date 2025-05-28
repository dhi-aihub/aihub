import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private s3: S3;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.s3 = new S3({
      region: configService.get<string>('S3_REGION'),
      accessKeyId: configService.get<string>('S3_ACCESS_KEY_ID'),
      secretAccessKey: configService.get<string>('S3_SECRET_ACCESS_KEY'),
      signatureVersion: 'v4',
    });

    this.bucket = configService.get<string>('S3_BUCKET');
  }

  getSignedUploadUrl(key: string): Promise<string> {
    const params = {
      Bucket: this.bucket,
      Key: key,
      Expires: 900, // 15 minutes
    };

    return this.s3.getSignedUrlPromise('putObject', params);
  }
}

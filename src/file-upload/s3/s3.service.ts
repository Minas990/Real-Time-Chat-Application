import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucket: string;
  private region: string;

  constructor() {
    this.region = process.env.AWS_REGION!
    this.bucket = process.env.AWS_S3_BUCKET!
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<{ url: string }> {
    const key = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    return { url };
  }

  async deleteFile(url: string): Promise<void> {
    const key = url.split('.amazonaws.com/')[1];
    if (key) {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    }
  }
}

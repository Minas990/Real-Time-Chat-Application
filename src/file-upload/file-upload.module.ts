import { BadRequestException, Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    S3Module,
    MulterModule.register({
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new BadRequestException('plz send image'), false);
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  ],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}

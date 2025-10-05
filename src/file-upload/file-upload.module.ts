import { BadRequestException, Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryModule } from './cloudinary/cloudinary.module';


@Module({
    imports:[
        CloudinaryModule,
        MulterModule.register
        (
            {
                storage:memoryStorage(),
                fileFilter:(req,file,cb) => {
                    if(file.mimetype.startsWith('image/'))
                    cb(null,true);
                    else cb(new BadRequestException('plz send image'),false);
                },
                limits : {
                    fileSize:10 * 1024 * 1024
                }
            }
        ),
    ],
    providers: [FileUploadService],
    exports:[FileUploadService]
})
export class FileUploadModule {}

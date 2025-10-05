import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import sharp from 'sharp';
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Injectable()

export class FileUploadService 
{
    constructor(private readonly cloudinaryService:CloudinaryService) {}
    async saveUserPhoto(file:Express.Multer.File,oldPhoto:string|undefined,folder:string)
    {
        
        const image = await this.resizeImage(file);
        try
        {
            const res = await this.cloudinaryService.uploadFile({...file,buffer:image},folder);
            if(oldPhoto)
                await this.cloudinaryService.deleteFile(oldPhoto);
            return res;
        }
        catch(err)
        {
            throw new InternalServerErrorException('something wrong in writing the img');
        }
    }
    
    async resizeImage(photo:Express.Multer.File)
    {
        const image =await sharp(photo.buffer)
        .resize(512,512,{fit:'contain'})
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toBuffer();
        return image;
    }
}
import { Inject, Injectable } from "@nestjs/common";
import { v2 as Cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';


@Injectable()
export class CloudinaryService 
{
    constructor(@Inject('CLOUDINARY') private readonly cloudinary: typeof Cloudinary){}

    uploadFile(file:Express.Multer.File,folder:string):Promise<UploadApiResponse> 
    {
        return new Promise<UploadApiResponse>((resolve,reject) => {
            const uploadStream = this.cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type:"auto",
                    
                },
                (err: UploadApiErrorResponse,result:UploadApiResponse) => 
                {
                    if(err) reject(err);
                    resolve(result);
                }
            )
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    async deleteFile(url: string):Promise<any>
    {
        const publidId = this.resolveCloudniaryUrl(url).replaceAll("%20"," ");
        return this.cloudinary.uploader.destroy(publidId)  ;
    }
    
    private resolveCloudniaryUrl(url:string)
    {
        const parts = url.split('/');
        const file = parts.pop(); // photo.jpg
        const folder = parts.slice(parts.indexOf('upload') + 2).join('/'); // folder
        return folder + '/' + file!.split('.')[0]; // folder/photo
    }
}
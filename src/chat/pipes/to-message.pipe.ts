import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { ChatService } from "../chat.service";


@Injectable()
export class ToMessagePipe implements PipeTransform
{
    constructor(private  chatService:ChatService){}
    async transform(value: number, metadata: ArgumentMetadata) {
        try
        {
            const message =await this.chatService.getMessageById(value);
            return message;
        }
        catch(err)
        {
            throw err;
        }
    }
}
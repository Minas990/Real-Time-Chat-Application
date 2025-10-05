import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import {Status as MessageStatus} from '../../common/status';

export class SendMessageDto
{
    @IsNotEmpty()
    @IsString()
    content:string;

    @IsNumber()
    @IsNotEmpty()
    receiverId:number;
}

export class MessageResponseDto
{
    id: number;
    content: string;
    senderId: number;
    receiverId: number;
    status: MessageStatus;
    createdAt: Date;
    senderName: string;
    senderUsername: string;
    receiverName:string;
    receiverUsername:string;
}
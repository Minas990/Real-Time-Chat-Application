import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from './entities/message.entity';
import {Status as MessageStatus} from '../common/status';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/entites/user.entity';
import { UserService } from 'src/user/user.service';
import { MessageResponseDto, SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService 
{
    constructor(
        @InjectRepository(MessageEntity) private messageRepo:Repository<MessageEntity> ,
        private userService : UserService
    ){}

    async sendMessage(sendMessageDto: SendMessageDto,sender:UserEntity)
    {
        const receiver = await this.userService.findOneUser(sendMessageDto.receiverId);
        if(!receiver)
            throw new NotFoundException('no such user');
        await this.markAllAsRead(receiver.id,sender.id);
        const message = this.messageRepo.create({
            ...sendMessageDto,
            senderId:sender.id,
            status: MessageStatus.SENT,        
        });
        const savedMessage = await this.messageRepo.save(message);
        if(receiver.state==="ONLINE")
        {
            await this.markAsDelivered(message.id);
            savedMessage.status = MessageStatus.DELIVERED;
            savedMessage.deliveredAt = new Date();
        }
        return this.formatMessageResponse(savedMessage,sender,receiver);
    }

    async getConversation(user: UserEntity, otherUser: UserEntity, page: number = 1, limit: number = 50): Promise<MessageResponseDto[]> 
    {
        if(page<=0 || limit <=0)
            throw new BadRequestException('page and limit should be grater than 0');
        const messages = await this.messageRepo.find({
            where:[
                {senderId:user.id,receiverId:otherUser.id},
                {senderId:otherUser.id,receiverId:user.id}
            ],
            order:{
                createdAt:'DESC'
            },
            take:limit,
            skip: (page-1)*limit
        })
    
        return messages.reverse().map(msg => this.formatMessageResponse(msg,msg.sender,msg.receiver));
    }

    async markAsDelivered(messageId: number): Promise<void> 
    {
        await this.messageRepo.update(messageId,{
            deliveredAt:new Date(),
            status:MessageStatus.DELIVERED
        });
    }

    async handlEnteringChat(senderId:number,receiverId:number)
    {
        const sender = await this.userService.findOneUser(senderId);
        await this.markAllAsRead(senderId,receiverId);
        return sender;
    }
    
    async markAsRead(message:MessageEntity)
    {
        return this.messageRepo.update(message.id,{
            status:MessageStatus.READ,
            readAt:new Date()
        })  ;
    }

    async getUnreadMessagesCount(userId:number):Promise<number>
    {   
        return this.messageRepo.count({
            where: {
                receiverId:userId,
                status:MessageStatus.DELIVERED
            }
        });
    }


    async getUnreadMessagesFromUser(userId: number, fromUserId: number): Promise<MessageEntity[]> 
    {
        return this.messageRepo.find({
            where: {
                receiverId: userId,
                senderId: fromUserId,
                status: MessageStatus.DELIVERED
            },
            order: { createdAt: 'ASC' }
        });
    }


    async deliverPendingMessages(userId: number): Promise<void> 
    {
        await this.messageRepo.update(
            { receiverId: userId, status: MessageStatus.SENT },
            { status: MessageStatus.DELIVERED, deliveredAt: new Date() }
        );
    }

    public async getMessageById(id:number): Promise<MessageResponseDto>
    {
        const message = await this.messageRepo.findOneBy({id});
        if(!message)
            throw new NotFoundException('no such message');
        return this.formatMessageResponse(message,message.sender,message.receiver);
    }

    private async markAllAsRead(senderId:number,receiverId:number)
    {
        const messages = await this.messageRepo.findBy({
            senderId,
            receiverId,
            status:MessageStatus.DELIVERED
        });
        const msgs:Array<any> = [];
        messages.forEach(
            (msg) => 
            {
                msgs.push(this.markAsRead(msg));
            }
        );
        return Promise.all(msgs);
    }

    private formatMessageResponse(message: MessageEntity,sender:UserEntity,receiver:UserEntity): MessageResponseDto 
    {
        return {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            receiverId: message.receiverId,
            status: message.status,
            createdAt: message.createdAt,
            senderName: sender.name,
            senderUsername: sender.username,
            receiverName:receiver.name,
            receiverUsername:receiver.username
        };
    }
}

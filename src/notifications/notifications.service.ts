import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationsEntity, NOTIFICATIONSTYPES } from './entities/notifications.entity';
import { In, Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import {Status as NotificationsStatus} from '../../common/status';
import { NotificationsResponse } from './types/notifications-Response.type';
@Injectable()
export class NotificationsService 
{
    constructor(@InjectRepository(NotificationsEntity) private notiRepo:Repository<NotificationsEntity>,
)
    {}
    
    async findOne(id:number)
    {
        const not = this.notiRepo.findOneBy({id});
        if(!not)
            throw new NotFoundException('no such notification');
        return not;
    }

    /**
     * 
     * @param emitterId //the sender
     * @param listenderId  // the receiver
     * @param type 
     * @param contentId // ref to post or message or
     * @param isOnline if the receiver is online will mark the noti as delivered
     */
    async newNoti(emitterId:number , listenerId:number,type:NOTIFICATIONSTYPES,contentId:number,isOnline:boolean)
    {
        const noti = this.notiRepo.create({
            senderId:emitterId,
            receiverId:listenerId,
            type,
            contentId,
        });
        if(isOnline)
            noti.status = NotificationsStatus.DELIVERED;
        const notification = await this.notiRepo.save(noti);
        return this.notiResponse(notification);
    }
    //get user nots 
    async getAllNotis(receiverId:number,page:number = 1,limit:number =5)
    {
        if(page <= 0 || limit <=0)
            throw new BadRequestException('page and limit > 0 ');
        const notis = await this.notiRepo.find(
            {
                where:{
                    receiverId
                },
                order:{
                    createdAt:'ASC'
                },
                take:limit,
                skip:(page-1) * limit 
            }
        );
        return notis.map((not) => this.notiResponse(not));
    }
    // mark as read 
    async markAsRead(not:NotificationsEntity)
    {
        return this.notiRepo.update(not.id,{
            status:NotificationsStatus.READ
        });
    }
    //count unreaded nots
    // async getCountOfUnreadNots(receiverId:number)
    // {
    //     return this.notiRepo.count(
    //         {
    //             where : {
    //                 receiverId,
    //                 status:NotificationsStatus.DELIVERED
    //             }
    //         }
    //     )
    // }


    //deliver unreaded nots
    async getUnreadNots(receiverId:number)
    {
        const nots =await this.notiRepo.find(
            {
                where : {
                    receiverId,
                    status:NotificationsStatus.DELIVERED
                },
                order:{
                    createdAt:'ASC'
                }
            },
        );
        return nots.map(not => this.notiResponse(not));
    }
    //handle connecting 
    async deliverPendingNotifications(receiverId:number)
    {
        await this.notiRepo.update({
            receiverId,
            status:NotificationsStatus.SENT
        },{status:NotificationsStatus.DELIVERED});
    }
    
    //mark all as read
    async markAllRead(receiverId:number)
    {
        const notifications = await this.notiRepo.findBy({
            receiverId,
            status:NotificationsStatus.DELIVERED
        });
        const nots:Array<any> = [];
        notifications.forEach(
            (not) => 
            {
                nots.push(this.markAsRead(not));
            }
        );
        return Promise.all(nots);
    }

    //make all nots about messages is read
    async markAllReadWhenSendMessage(senderId:number,receiverId:number)
    {
        return this.notiRepo.update(
            {
                senderId,
                receiverId,
                type:NOTIFICATIONSTYPES.MESSAGE,
                status:NotificationsStatus.DELIVERED
            },
            {
                status:NotificationsStatus.READ
            }
        )
    }

    //make all nots about fr is read
    async markReadWhenAcceptingOrRejectingRequest(receiverId:number,contentId:number)
    {
        return this.notiRepo.update(
            {
                receiverId,
                type:NOTIFICATIONSTYPES.FRIEND_REQUEST,
                contentId,
                status:NotificationsStatus.DELIVERED
            },
            {
                status:NotificationsStatus.READ
            }
        )
    }
    //format 
    private notiResponse(noti:NotificationsEntity):NotificationsResponse
    {
        return {
            id:noti.id,
            type:noti.type,
            contentId:noti.contentId,
            emitter:noti.senderId,
            createdAt:noti.createdAt,
        };
    }
}

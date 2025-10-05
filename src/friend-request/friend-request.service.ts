import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendRequestEntity, RequestStatus } from './entities/friend-request.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FriendRequestService 
{
    constructor(@InjectRepository(FriendRequestEntity) private friendRequestRepo:Repository<FriendRequestEntity>,
private userSerivce:UserService ) {}

    async createNewFriendReqeuest(senderId:number,receiverId:number)
    {
        await this.userSerivce.findOneUser(receiverId); // if no such receiver -> throw error

        const oldFr = await this.friendRequestRepo.findOne({
            where: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        });

        
        if(oldFr?.status=== RequestStatus.ACCEPTED)
            throw new BadRequestException('u already friends');
        else if(oldFr?.status === RequestStatus.PENDING)
            throw new BadRequestException('u already sent one');
        else if(oldFr)
        {
            oldFr.status =RequestStatus.PENDING;
            oldFr.createdAt = new Date();
            return this.friendRequestRepo.save(oldFr); 
        }
        const fr = this.friendRequestRepo.create({
            senderId,
            receiverId
        });
        return this.friendRequestRepo.save(fr);
    }


    async getMyFriendRequest(id:number)
    {
        return this.friendRequestRepo.find(
            {
                where : 
                {
                    senderId:id,
                    status:RequestStatus.PENDING
                }
            }
        )
    }

    async getReceivedFriendRequest(id:number)
    {
        return this.friendRequestRepo.find(
            {
                where : 
                {
                    receiverId:id,
                    status:RequestStatus.PENDING
                }
            }
        )
    }

    //accept or reject
    async updateFr(receiverId:number,frId:number,newStatus:RequestStatus)
    {
        const fr =await this.friendRequestRepo.findOneBy({
            receiverId,
            id:frId,
            status:RequestStatus.PENDING
        });
        if(!fr)
            throw new NotFoundException('no such fr');
        fr.status = newStatus
        return this.friendRequestRepo.save(fr);
    }

    async deleteFr(senderId:number,receiverId:number)
    {
        const fr = await this.friendRequestRepo.findOne({
            where : 
            [
                {
                    receiverId,
                    senderId,
                    status:RequestStatus.ACCEPTED
                } 
                ,
                {
                    receiverId:senderId,
                    senderId:receiverId,
                    status:RequestStatus.ACCEPTED
                }
            ] 
        });
        if(!fr)
            throw new NotFoundException('no such fr');
        return this.friendRequestRepo.delete(fr.id);
    }
}

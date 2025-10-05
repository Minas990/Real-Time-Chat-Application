import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendEntity } from './entities/friend.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FriendService 
{
    constructor(
        @InjectRepository(FriendEntity) private friendRepo:Repository<FriendEntity>,
        
    ){}

    async addFriend(user1Id:number,user2Id:number)
    {
        const friend =  this.friendRepo.create({
            user1Id,
            user2Id
        });
        return this.friendRepo.save(friend);
    }

    async removeFriend(user1Id:number,user2Id:number)
    {
        const friend =await this.friendRepo.findOneBy({
            user1Id,
            user2Id
        });
        if(!friend)
            throw new NotFoundException('no such friend');
        return this.friendRepo.delete(friend.id);
    }

    async getALlFriends(userId:number)
    {
        const friends = await this.friendRepo.createQueryBuilder('friends')
        .leftJoinAndSelect('friends.user1','user1')
        .leftJoinAndSelect('friends.user2','user2')
        .where('friends.user1Id = :userId OR friends.user2Id = :userId',{userId})
        .getMany();
        return friends.map(f => 
            {
                return f.user1Id === userId ? f.user2Id:f.user1Id
            }
        );
    }

    async checkFriends(user1Id:number,user2Id:number)
    {
        return this.friendRepo.findOne({
            where: 
            {
                user1Id:(user1Id > user2Id ? user2Id:user1Id),
                user2Id:(user1Id > user2Id ? user1Id:user2Id),
            },
            
        })
    }


}

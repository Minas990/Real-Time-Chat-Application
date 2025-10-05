import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { currentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard.guard';
import { UserEntity } from 'src/user/entites/user.entity';
import { FriendService } from './friend.service';
import { UserExistPipe } from 'src/user/pipes/user-exist.pipe';
import { FriendRequestService } from 'src/friend-request/friend-request.service';
@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendController 
{
    constructor(
        private friendService:FriendService,
        private friendRequestService:FriendRequestService,
    ) {}

    @Get('/')
    async getFriends(@currentUser() user:UserEntity)
    {
        return this.friendService.getALlFriends(user.id);
    }

    
    @Delete('/delete/:id')
    async deleteFriend(@currentUser() user:UserEntity,@Param('id',UserExistPipe) user2:UserEntity)
    {
        let [user1Id,user2Id] = [user.id,user2.id];
        if(user1Id>user2Id)
        [user1Id,user2Id] = [user2Id,user1Id];

        await this.friendService.removeFriend(user1Id,user2Id);
        await this.friendRequestService.deleteFr(user1Id,user2Id);
    }
}

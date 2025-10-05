import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { currentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard.guard';
import { UserEntity } from 'src/user/entites/user.entity';
import { FriendRequestService } from './friend-request.service';

@Controller('friend-request')
@UseGuards(JwtAuthGuard)
export class FriendRequestController 
{
    constructor(private friendRequestService:FriendRequestService)
    {

    }

    @Get('/sent')
    async getSentFriendRequest(@currentUser() user:UserEntity)
    {
        return this.friendRequestService.getMyFriendRequest(user.id);
    }

    @Get('/received')
    async getReceivedFriendRequest(@currentUser() user:UserEntity)
    {
        return this.friendRequestService.getReceivedFriendRequest(user.id);
    }

}

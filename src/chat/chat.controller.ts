import { BadRequestException, Controller, ForbiddenException, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { currentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard.guard';
import { UserEntity } from 'src/user/entites/user.entity';
import { ChatService } from './chat.service';
import { UserService } from 'src/user/user.service';
import { MessagesQueryDto } from './dto/messages-query.dto';
import { ToMessagePipe } from './pipes/to-message.pipe';
import { MessageEntity } from './entities/message.entity';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class ChatController 
{
    constructor(
        private chatService:ChatService,
        private userService:UserService
    ){}

    @Get('/:id')
    async getMessage(@currentUser() user:UserEntity,@Param('id',ToMessagePipe) message:MessageEntity)
    {
        
        if(user.id != message.receiverId && user.id != message.senderId)
            throw new ForbiddenException('not yours');
        return message;
    }

    @Get('/conversation/:receiverId')
    async getConversation(
        @currentUser()user:UserEntity,
        @Param('receiverId') receiverId:number,
        @Query() query:MessagesQueryDto)
    {
        if(isNaN(receiverId))
            throw new BadRequestException('recieverId is a number');
        const receiver = await this.userService.findOneUser(receiverId);
        if(!receiver)
            throw new NotFoundException('no such user');
        return this.chatService.getConversation(user,receiver,query.page,query.limit);
    }

    @Get('/unread/count')
    async getUnreadedMessagesCount(@currentUser() user:UserEntity)
    {
        return { count:await this.chatService.getUnreadMessagesCount(user.id)} 
    }

}   

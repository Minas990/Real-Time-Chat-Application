import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { currentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard.guard';
import { NotificationsService } from './notifications.service';
import { MessagesQueryDto } from 'src/chat/dto/messages-query.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController 
{
    constructor(private readonly notiService:NotificationsService){}
    @Get('/')
    async getAllNots(@currentUser() user,@Query() query:MessagesQueryDto)
    {
        return this.notiService.getAllNotis(user.id,query.page,query.limit);
    }
}

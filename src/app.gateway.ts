import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import {Namespace, Server,Socket} from 'socket.io'
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Status, UserEntity } from 'src/user/entites/user.entity';
import { BadRequestException, UnauthorizedException, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChatService } from './chat/chat.service';
import { SendMessageDto } from './chat/dto/send-message.dto';
import { PreventSelfMessageGuard } from './chat/guards/same-sender-Receiver.guard';
import { NotificationsService } from './notifications/notifications.service';
import { NOTIFICATIONSTYPES } from './notifications/entities/notifications.entity';
import { EnterCHatDto } from './chat/dto/enter-chat.dto';
import { FriendRequestService } from './friend-request/friend-request.service';
import { FriendRequestDto } from './friend-request/dto/friend-request.dto';
import { AcceptFriendRequestDto } from './friend-request/dto/accept-request.dto';
import { RequestStatus } from './friend-request/entities/friend-request.entity';
import { FriendService } from './friend/friend.service';
import { WsExceptionsFilter } from './filter/web-socket.filter';



@UseFilters(WsExceptionsFilter)
@WebSocketGateway({cors:{origin:'*'},namespace:'/real-time'})
@UsePipes(new ValidationPipe({ transform: true, whitelist: true,disableErrorMessages:false }))

export class AppGateWay implements OnGatewayConnection,OnGatewayDisconnect,OnGatewayInit
{
    @WebSocketServer()
    server:Server;

    private connectedUsers = new Map<number,string>();
    constructor(
        private chatService:ChatService,
        private userService:UserService,
        private jwtService:JwtService,
        private notiService:NotificationsService,
        private frService:FriendRequestService,
        private friendService:FriendService
    )
    {}
    //auth guard doesnt work
    afterInit() {
        this.server.use(async(socket:any,next:any) => {
            try
            {
                const token =
                socket.handshake.auth?.token ||
                socket.handshake.query?.token ||
                socket.handshake.headers?.authorization?.replace('Bearer ', '');
                if (!token) throw new WsException('Unauthorized');
                const payload = this.jwtService.verify(token,{
                    secret:process.env.JWT_SECRET
                });
                const user = await this.userService.findOneUser(payload.id);
                socket.data.user = user;
                next();
            }
            catch (err) 
            {
                console.log(err.message);
                next(err);
            }
        })
    }
    //auth guard will not work
    async handleConnection(client: Socket) 
    {
        try
        {
            const user = client.data.user;
            
            if(!user)
            {
                client.disconnect();
                throw new BadRequestException('no such user');
            }

            if(this.connectedUsers.get(user.id))
                throw new WsException('no more than 1 connection')
            this.connectedUsers.set(user.id,client.id);

            client.data.userId = user.id;
            client.data.user = user;

            await this.userService.updateUserStatus(user.id, Status.ONLINE);
            await this.chatService.deliverPendingMessages(user.id);//just update the message to delivered
            await this.notiService.deliverPendingNotifications(user)//same as above but for nots -> inheritance would be greate here :()
            const nots = await this.notiService.getUnreadNots(user.id);
            

            console.log(`User ${user.username} connected`);

            client.emit('notification',nots)
            client.broadcast.emit('user-online', { 
                id: user.id, 
                username: user.username ,
                Image:user.profileImage,
                email:user.email
            });
        }
        catch(err)
        {
            console.log(err.message);
            client.disconnect();
        }
    }
    //auth guard will not work
    async handleDisconnect(client: Socket)
    {
        try
        {
            const userId = client.data.userId;
    
            if (userId) {
                this.connectedUsers.delete(userId);
            }
    
            await this.userService.updateUserStatus(userId, Status.OFFLINE);
            console.log(`User ${client.data.user?.username} disconnected`);
    
            client.broadcast.emit('user-offline', { 
                userId, 
                username: client.data.user.username 
            });
        }
        catch(err)
        {
            console.log(err.message);
        }
    }

    @UseGuards(PreventSelfMessageGuard)
    @SubscribeMessage('chat-send-message')
    
    async handleSendMessage
    (
        @MessageBody() sendMessageDto: SendMessageDto,
        @ConnectedSocket() client: Socket,
    ) 
    {
        try
        {
            //get the sender id
            const currentUser:UserEntity = client.data.user;
            const senderId = currentUser.id;

            //friends ? 
            const friend =await this.friendService.checkFriends(senderId,sendMessageDto.receiverId);
            if(!friend )
                throw new WsException('u r not friends!');
            //make the message
            const message = await this.chatService.sendMessage(sendMessageDto, currentUser);

            //if receiver is online deleiver the msg to him
            const receiverSocketId = this.connectedUsers.get(sendMessageDto.receiverId);
            const notification = await this.notiService.newNoti(
                senderId,
                sendMessageDto.receiverId,
                NOTIFICATIONSTYPES.MESSAGE,message.id,
                receiverSocketId ? true:false
            );

            //now all the messages that the *current* receiver sent must be read not  delivered
            /*
                so we should update every notifications that has senderId = current Receiver and
                of type message 
            */
            await this.notiService.markAllReadWhenSendMessage(sendMessageDto.receiverId,senderId);

            if (receiverSocketId) {
                this.server.to(receiverSocketId).emit('chat-new-message', message);
                this.server.to(receiverSocketId).emit('notification',notification);
            } 
            //else the user is OFFLINE 

            //----dont get confused with the above comment this for the sender--//
            client.emit('chat-message-sent', message,senderId,sendMessageDto.receiverId);
        }
        catch(err)
        {
            console.log(err.message);
            throw new WsException(err.message);
        }
    }
    //receiver enter the chat
    @SubscribeMessage('chat-enterChat')
    async handleEnterChat(@MessageBody() body:EnterCHatDto ,@ConnectedSocket() client:Socket )
    {
        try
        { 
            const receiver:UserEntity = client.data.user;
            const sender = await this.chatService.handlEnteringChat(body.senderId,receiver.id);
            // mark all noti related to this messages as read 
            await this.notiService.markAllReadWhenSendMessage(sender.id,receiver.id);
            if(sender?.state===Status.ONLINE ) 
            {
                const senderSocketId = this.connectedUsers.get(sender.id);
                //should be here iff the user online 
                if(senderSocketId)
                    client.to(senderSocketId).emit('chat-message-seen',{
                        id:receiver.id,
                        name:receiver.name,
                        username:receiver.name,
                    });
            }
            return true;
        }
        catch(err)
        {
            console.log(`err ${err.message}`);
            throw new WsException(err.message);
        }
    }

    @SubscribeMessage('notification-read')
    async handleReadNotification(@ConnectedSocket() client:Socket)
    {
        try
        {
            await this.notiService.markAllRead(client.data.userId);
            return true;
        }
        catch(err)
        {
            console.log(`err ${err.message}`);
            throw new WsException(err.message);
        }
    }


    // we can compine both rest with websocket 
    // make a route for posting a new fr 
    // make a utility function in our gateway that emit the event
    // but ill do only websocket 
    
    @SubscribeMessage('send-friend-request')
    async sendFriendRequest(@ConnectedSocket() client:Socket,@MessageBody() body:FriendRequestDto)
    {
        try
        {
            const senderId:number = client.data.userId;
            const receiverId = body.userId;
            
            if(receiverId===senderId)
                throw new WsException('u already the best friend to ur self <3');

            const fr = await this.frService.createNewFriendReqeuest(senderId,receiverId);

            const receiverSocketId = this.connectedUsers.get(receiverId);
            const not = await this.notiService.newNoti(senderId,receiverId,NOTIFICATIONSTYPES.FRIEND_REQUEST,fr.id,receiverSocketId ? true:false);

            if(receiverSocketId)
                client.to(receiverSocketId).emit('notification',not);

            return true;
        }
        catch(err)
        {
            console.log(`err ${err.message}`);
            throw new WsException(err.message);
        }
    }

    
    
    /*
        the reciever of the fr will accept it or reject 
        the sender will be notified iff the reciever accept it 
    */
    @SubscribeMessage('answer-friend-request')
    async acceptFriendRequest(@ConnectedSocket() client:Socket,@MessageBody() body:AcceptFriendRequestDto)
    {
        try
        {
            //is the fr exist ? 
            const receiverId:number = client.data.userId;
            const fr = await this.frService.updateFr(receiverId,body.friendRequestId, body.newStatus);
            //update the old nots related to this fr to read
            await this.notiService.markReadWhenAcceptingOrRejectingRequest(receiverId,body.friendRequestId);
            if(body.newStatus != RequestStatus.ACCEPTED)
                return true;
            const senderId = fr.senderId;
            const friend = await this.friendService.addFriend(receiverId,senderId);
            const senderSocketId = this.connectedUsers.get(senderId);
            const not = await this.notiService.newNoti(receiverId,senderId,NOTIFICATIONSTYPES.NEW_FRIEND,friend.id,senderSocketId?true:false);
            if(senderSocketId && body.newStatus === RequestStatus.ACCEPTED)
                client.to(senderSocketId).emit('notification',not);
            return true;
        }
        catch(err)
        {
            console.log(`err ${err.message}`);
            throw new WsException(err.message);
        }
    }
}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user/entites/user.entity';
import { FileUploadModule } from './file-upload/file-upload.module';
import { ChatModule } from './chat/chat.module';
import { MessageEntity } from './chat/entities/message.entity';
import { NotificationsModule } from './notifications/notifications.module';
import { NotificationsEntity } from './notifications/entities/notifications.entity';
import { AppGateWay } from './app.gateway';
import { FriendRequestModule } from './friend-request/friend-request.module';
import { FriendRequestEntity } from './friend-request/entities/friend-request.entity';
import { FriendModule } from './friend/friend.module';
import { FriendEntity } from './friend/entities/friend.entity';



@Module({

  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
    }),
    TypeOrmModule.forRoot({
      type:'postgres',
      database:process.env.DB_NAME,
      username:process.env.DP_USERNAME,
      entities:[UserEntity,MessageEntity,NotificationsEntity,FriendRequestEntity,FriendEntity],
      password: process.env.DP_PASS,
      port: parseInt(process.env.DP_PORT ?? '5432'),
      host:process.env.HOST,
      synchronize:true //<- be careful
    }),
    UserModule,
    AuthModule,
    FileUploadModule,
    ChatModule,
    NotificationsModule,
    FriendRequestModule,
    FriendModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppGateWay],
})
export class AppModule {}

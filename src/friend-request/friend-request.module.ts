import { Module } from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { FriendRequestController } from './friend-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequestEntity } from './entities/friend-request.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([FriendRequestEntity]),
    AuthModule
  ],
  providers: [FriendRequestService],
  controllers: [FriendRequestController],
  exports:[FriendRequestService]
})
export class FriendRequestModule {}

import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendEntity } from './entities/friend.entity';
import { AuthModule } from 'src/auth/auth.module';
import { FriendRequestModule } from 'src/friend-request/friend-request.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([FriendEntity]),
    AuthModule,
    FriendRequestModule
  ],
  providers: [FriendService],
  controllers: [FriendController],
  exports:[FriendService]
})
export class FriendModule {}

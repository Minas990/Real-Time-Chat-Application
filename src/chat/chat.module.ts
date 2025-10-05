import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './entities/message.entity';

@Module({
    imports:[
        TypeOrmModule.forFeature([MessageEntity]),
        UserModule,
        AuthModule,
    ],
    providers: [ChatService],
    controllers: [ChatController],
    exports:[ChatService]
})
export class ChatModule {}

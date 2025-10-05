import { Global, Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsEntity } from './entities/notifications.entity';

@Module({
  imports:[AuthModule,TypeOrmModule.forFeature([NotificationsEntity])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports:[NotificationsService]
})
export class NotificationsModule {}

import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entites/user.entity';
import { FileUploadModule } from 'src/file-upload/file-upload.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([UserEntity]),
    FileUploadModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports:[UserService]
})
export class UserModule  {}

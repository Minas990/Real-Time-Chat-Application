import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity, UserRole } from './entites/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserExistPipe } from './pipes/user-exist.pipe';
import { ROLES } from '../auth/decorators/roles.decorator';
import {  IsAdminGuard } from './guards/isAdminGuard.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-guard.guard';
import { Serialize } from '../interceptors/delete-password.interceptor';
import { UserResponsDto } from './dto/user-responce.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { currentUser } from 'src/auth/decorators/current-user.decorator';
import { ConfirmedEmail } from 'src/auth/guards/cofnirmed-email.guard';


@Controller('user')
@Serialize(UserResponsDto)
@UseGuards(JwtAuthGuard,ConfirmedEmail)
export class UserController 
{
    constructor(private readonly userService:UserService){}
    
    @ROLES(UserRole.ADMIN)
    @UseGuards(IsAdminGuard)
    @Get()
    async getAllUsers(): Promise<UserEntity[]>
    {
        return this.userService.findAllUsers();
    }

    @Get('/:id')
    async getUser(@Param('id') id:number):Promise<UserEntity>
    {
        if(isNaN(id))
            throw new BadRequestException('use a number instead plz');
        return this.userService.findOneUser(id);
    }

    @Patch('/')
    async updateUser(@currentUser() user:UserEntity , @Body() body:UpdateUserDto)
    {
        return this.userService.updateUser(user,body);
    }
    
    @ROLES(UserRole.ADMIN)
    @UseGuards(IsAdminGuard)
    @Delete('/:id')
    async remove(@Param('id',UserExistPipe) user:UserEntity )
    {
        if(user.role===UserRole.ADMIN)
            throw new BadRequestException('admins cannot delete each others');
        await this.userService.removeUser(user);
    }

    @Patch('/photo/upload')
    @UseInterceptors(FileInterceptor('photo'))
    async uploadPhoto(@currentUser() user:UserEntity,@UploadedFile() file:Express.Multer.File)
    {
        return this.userService.updateUserPhoto(user,file);
    }

}

import { BadRequestException, ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Status, UserEntity } from './entites/user.entity';
import { MoreThan, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto'
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { GoogleUser } from 'src/auth/types/google-User.type';

@Injectable()
export class UserService implements OnModuleInit
{

    constructor(
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
        private readonly fileService:FileUploadService
    ) 
    {
        
    }

    //mark all users as offline 
    async onModuleInit() {
        await this.userRepo
        .createQueryBuilder()
        .update(UserEntity)
        .set({ state: Status.OFFLINE })
        .execute();
    }
    
    async findAllUsers(): Promise<UserEntity[]> 
    {
        return this.userRepo.find();
    }

    async findOneUser(id:number): Promise<UserEntity> 
    {
        const user = await this.userRepo.findOneBy({id});
        if(!user) throw new NotFoundException('no such user');
        return user;
    }


    async getUserByEmailOrUsername(username:string | undefined,email:string | undefined):Promise<UserEntity>
    {
        const user =  await this.userRepo.findOne({
            where:{
                username,
                email
            }
        });
        if(!user)
            throw new NotFoundException('no such user');
        return user;
    }

    
    async createUser(createUserDto : CreateUserDto) :Promise<UserEntity>
    {
        const conflicts = await this.oldUser(createUserDto.username, createUserDto.email);
        if (conflicts.length) 
            throw new ConflictException(`${conflicts.join(' and ')} already exist`);
        
        const newUser = this.userRepo.create({
            email:createUserDto.email,
            password:await (this.hashPassword(createUserDto.password)),
            username:createUserDto.username,
            name:createUserDto.name
        });
        return this.userRepo.save(newUser);
    }

    private async hashPassword(password:string)
    {
        return bcrypt.hash(password,12);
    }
        
    async updateUser(user:UserEntity,updateUserDto:UpdateUserDto): Promise<UserEntity>
    {

        const conflicts = await this.oldUser(updateUserDto.username, updateUserDto.email);
        if (conflicts.length) 
            throw new ConflictException(`${conflicts.join(' and ')} already exist`);

        Object.assign(user,updateUserDto);
        if(updateUserDto.email)
            user.confirmEmail = false;
        return this.userRepo.save(user);
    }

    async removeUser(user:UserEntity) :Promise<void>
    {
        await this.userRepo.remove(user);
    }

    async updateUserOTP(email:string)
    {
        const user = await this.userRepo.findOneBy({email});
        if(!user) throw new NotFoundException('no such user'); //impossible 
        const otp = crypto.randomInt(100000,999999).toString();
        user.OTP = otp;
        user.OTPExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await this.userRepo.save(user);
        return otp;
    }

    async updateEmailConfirmation(user:UserEntity,otp:string)
    {
        if(!this.checkDataConfirmation(user))
            throw new BadRequestException('expired plz send cofirmation email again');
        if(otp!=user.OTP)
            throw new BadRequestException('wrong one pal!');
        user.confirmEmail = true;
        await this.userRepo.save(user);
    }

    async updateUserPhoto(user:UserEntity,file:Express.Multer.File)
    {
        if (!file) 
            throw new BadRequestException('No photo provided');
        const oldPhoto = user.profileImage;
        const photoPath = await this.fileService.saveUserPhoto(file,oldPhoto,this.userPath);
        user.profileImage = photoPath.url;
        return this.userRepo.save(user);
    }

    async updatePassword(user:UserEntity,password:string) : Promise<UserEntity>
    {
        user.password = await this.hashPassword(password);
        user.passwordChangedAt =new Date(Date.now() - 5 * 60 * 1000);
        return this.userRepo.save(user);
    }

    async generatePasswordResetToken(user:UserEntity)
    {
        const token = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
        const timeS = 30 * 60 * 1000;
        user.passwordResetTokenExpiresAt =new Date(Date.now() + timeS);//30 m
        await this.userRepo.save(user);
        return token;
    }

    async deletePasswordResetToken(user:UserEntity)
    {
        //-T
        user.passwordResetToken =null;
        user.passwordResetTokenExpiresAt =null;
        await this.userRepo.save(user);
    }
    
    async resetPassword(token:string,password:string)
    {
        const user = await this.userRepo.findOne({
            where: {
                passwordResetToken:token,
                passwordResetTokenExpiresAt:MoreThan(new Date())
            }
        });
        if(!user)
            throw new NotFoundException('no such user or token is expired')

        user.password = await this.hashPassword(password);
        user.passwordChangedAt = new Date(Date.now() - 2 * 60 * 1000);
        user.passwordResetToken = null;
        user.passwordResetTokenExpiresAt = null;
        //if he the owner of the email no need to ask him to confirm it
        if(!user.confirmEmail)
            user.confirmEmail = true;
        return await this.userRepo.save(user);
    }

    async updateUserStatus(userId:number,state: Status)
    {
        await this.userRepo.update(userId,{
            state
        });
    }
    
    private checkDataConfirmation(user:UserEntity):boolean
    {
        const otpDate = user.OTPExpiresAt?.getTime();
        return (otpDate >= Date.now());
    }
    
    private async oldUser(username: string, email: string): Promise<string[]> {
        const conflicts: string[] = [];

        if (username &&  await this.userRepo.findOneBy({ username })) {
            conflicts.push('username');
        }
        if (email && await this.userRepo.findOneBy({ email })) {
            conflicts.push('email');
        }
        return conflicts;
    }
    // for google oauath
    async googleUserByEmail(user:GoogleUser):Promise<UserEntity>
    {
        const oldUser = await this.userRepo.findOneBy({email:user.email});
        if(oldUser)
            return oldUser;
        const newUser = this.userRepo.create({
            confirmEmail:true,
            email:user.email,
            name:user.name,
            username:user.sub+Date.now()+"@GmaOril",
            password:crypto.randomBytes(32).toString('hex'),
            profileImage:user.picture
        });
        return this.userRepo.save(newUser);
    }
    private userPath = "users photo";
}

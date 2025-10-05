import {  BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/email.service';
import { UserEntity } from 'src/user/entites/user.entity';
import * as crypto from 'crypto';
import { GoogleUser } from './types/google-User.type';

@Injectable()
export class AuthService 
{
    constructor
    (
        private readonly userService:UserService,
        private readonly jwtService:JwtService,
        private readonly emailService:EmailService
    ) {}

    async signup(body: CreateUserDto) {
        const user = await this.userService.createUser(body);
        const token = this.signToken(user.id);
        return {
            user,
            token
        };
    }
    async logIn(username:string | undefined,email:string | undefined,password:string)
    {
        let user =await this.userService.getUserByEmailOrUsername(username,email);
        if(!(await this.compareHashedPassword(password,user.password)) )
            throw new BadRequestException('password is wrong');
        const token = this.signToken(user.id);
        return {
            user,token
        };
    }


    async sendConfirmationEmail(email:string)
    {
        const otp = await this.userService.updateUserOTP(email);
        await this.emailService.sendEmail({
            subject: 'Your Confirmation Code',
            user:email,
            text:`Your verification code is ${otp}. It will expire in 10 minutes.`
        });
    }

    async confirmEmail(user:UserEntity, otp:string)
    {
        try
        {
            await this.userService.updateEmailConfirmation(user,otp);
        }
        catch(err)
        {
            throw err;
        }
    }

    async updatePassword(password:string,newPassword:string,user:UserEntity)
    {
        if(!(await this.compareHashedPassword(password,user.password)))
            throw new BadRequestException('password is wrong try forget password instead');
        await this.userService.updatePassword(user,newPassword);
        return this.signToken(user.id);
    }

    async forgetPassword(email:string,url:string)
    {
        const user = await this.userService.getUserByEmailOrUsername(undefined,email);
    
        console.log(url);
        const token = await this.userService.generatePasswordResetToken(user);
        try
        {
            await this.emailService.sendEmail({
                subject:'password reset',
                user:email,
                text:`plz click on this url to reset ur password ${url}/${token}`
            })
        }
        catch(err)
        {
            await this.userService.deletePasswordResetToken(user);
            throw err;
        }
    }

    async resetPassword(unhashedToken:string ,password:string )
    {
        const hashedToken =  crypto.createHash('sha256').update(unhashedToken).digest('hex');
        const user = await this.userService.resetPassword(hashedToken,password);
        return this.signToken(user.id);
    }

    private signToken(id:number) {
        return this.jwtService.sign({id},{
            expiresIn:'1h',
            secret:process.env.JWT_SECRET
        });
    }

    private async compareHashedPassword(originalPassword:string,hashedPassword:string)
    {
        return bcrypt.compare(originalPassword,hashedPassword);
    }

    //google auth
    async signupWithGoogle(googleUser:GoogleUser)
    {
        const  user= await this.userService.googleUserByEmail(googleUser);
        const token = this.signToken(user.id);
        return {user,token};
    }
}

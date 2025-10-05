import { BadRequestException, Body, Controller, Get, Param, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LogInDto } from './dto/log-in.dto';
import type {Response,Request} from 'express'
import { Serialize } from 'src/interceptors/delete-password.interceptor';
import { UserResponsDto } from 'src/user/dto/user-responce.dto';
import { currentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-guard.guard';
import { UserEntity } from 'src/user/entites/user.entity';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { NotConfirmedEmail } from './guards/not-confirmed-email.guard';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ConfirmedEmail } from './guards/cofnirmed-email.guard';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { googleGuard } from './guards/google-guard.guard';
import { GoogleUser } from './types/google-User.type';

@Controller('auth')

@Serialize(UserResponsDto)
export class AuthController 
{
    constructor
    (
        private readonly authService:AuthService,
    ) {}
    
    @Post('/signup')
    async signup(@Body() body:CreateUserDto,@Res({passthrough:true})res:Response  )
    {
        const {user,token} =await this.authService.signup(body);
        res.cookie('jwt',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            maxAge: 3600000
        });
        return user;
    }

    @Post('/login')
    async login(@Body() body : LogInDto,@Res({passthrough:true})res:Response  )
    {
        if(!body.email && !body.username)
            throw new BadRequestException('provide username or email plz');
        const {user,token} =await this.authService.logIn(body.username,body.email,body.password);
        res.cookie('jwt',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            maxAge: 3600000
        });
        return user;
    }

    @UseGuards(JwtAuthGuard,NotConfirmedEmail)
    @Post('/confirm')
    async sendConfirmation(@currentUser() user:UserEntity)
    {
        return this.authService.sendConfirmationEmail(user.email);
    }

    @UseGuards(JwtAuthGuard,NotConfirmedEmail)
    @Post('/confirm/email')
    async confirmEmail(@currentUser() user:UserEntity,@Body() body:ConfirmEmailDto)
    {
        if(!user.OTP)
            throw new BadRequestException('u have no otp');
        return this.authService.confirmEmail(user,body.otp);
    }


    @UseGuards(JwtAuthGuard,ConfirmedEmail)
    @Post('/updatePassword')
    async updatePassword
    (
        @Body() body: UpdatePasswordDto,
        @currentUser() user:UserEntity,
        @Res({passthrough:true})res:Response
    )
    {
        const token = await this.authService.updatePassword(body.password,body.newPassword,user);
        res.cookie('jwt',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            maxAge: 3600000
        });
        return token;
    }

    @Post('/forgetPassword')
    async forgetPassword(@Body() body:ForgetPasswordDto,@Req() req:Request)
    {
        const url = `${req.protocol}://${req.get('host')}/auth/resetPassword`;
        return this.authService.forgetPassword(body.email,url);   
    }

    @Post('/resetPassword/:token')
    async resetPassword(@Param('token') token:string,@Body() body:ResetPasswordDto,@Res({passthrough:true}) res:Response)
    {
        const jwtToken = await this.authService.resetPassword(token,body.password);
        res.cookie('jwt',jwtToken,{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            maxAge: 3600000
        });
        return jwtToken;
    }

    @Get('google')
    @UseGuards(googleGuard)
    async signUpGoogle()
    {
        //dummy function the guard will redirect it anyway
    }

    @Get('oauth/google')
    @UseGuards(googleGuard)
    async googleCallBack(@Req() req:Request,@Res({passthrough:true}) res:Response)
    {
        const {token,user} = await this.authService.signupWithGoogle(req.user as GoogleUser);
        res.cookie('jwt',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            maxAge: 3600000
        });
        return user;
    }
}

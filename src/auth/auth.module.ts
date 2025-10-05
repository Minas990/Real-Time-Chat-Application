import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import {  PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './stratigies/jwt-strategy.srategy';
import { EmailModule } from 'src/email/email.module';
import { GoogleStrategy } from './stratigies/google-strategy.strategy';

@Module({
  imports:[
    UserModule,
    JwtModule.register({}),
    PassportModule,
    EmailModule
  ],
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy,GoogleStrategy],
  exports:[JwtModule,UserModule]
})
export class AuthModule {}

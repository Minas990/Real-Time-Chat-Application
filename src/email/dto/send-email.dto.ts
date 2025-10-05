import {  IsString, IsEmail } from 'class-validator';

export class sendEmailDto {
    @IsEmail()
    user: string;

    @IsString()
    subject: string;

    @IsString()
    text?: string;
}
import { IsEmail, IsString } from "class-validator";

export class ForgetPasswordDto
{
    @IsEmail()
    @IsString()
    email:string;
}
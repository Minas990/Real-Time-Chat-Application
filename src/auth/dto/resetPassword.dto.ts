import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class ResetPasswordDto
{
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    password:string;
}
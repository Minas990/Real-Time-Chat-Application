import { Transform } from "class-transformer";
import { IsAlphanumeric, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";


export class CreateUserDto
{
    @IsString()
    @MaxLength(50)
    @Transform(({value})=> value?.trim())
    name:string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email:string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(50)
    password:string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    @IsAlphanumeric()
    username:string;
}
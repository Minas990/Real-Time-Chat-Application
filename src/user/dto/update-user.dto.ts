import { Transform } from "class-transformer";
import { IsAlphanumeric, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateUserDto
{
    @IsString()
    @MaxLength(50)
    @Transform(({value})=> value?.trim())
    @IsOptional()
    name:string;
    
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @IsOptional()
    email:string;


    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    @IsAlphanumeric()
    @IsOptional()
    username:string;

}
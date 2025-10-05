import { IsAlphanumeric, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";



export class LogInDto {
    @ValidateIf( o => !o.username)
    @IsString()
    @IsEmail()
    @IsOptional()
    email?:string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(50)
    password:string;


    @ValidateIf( o => !o.email)
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    @IsAlphanumeric()
    @IsOptional()
    username?:string;
}
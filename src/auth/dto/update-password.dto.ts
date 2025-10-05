import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class UpdatePasswordDto
{
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(50)
    password:string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(50)
    newPassword:string;
}
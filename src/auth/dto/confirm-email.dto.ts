import { IsNumber, IsString, Length } from "class-validator";


export class ConfirmEmailDto 
{
    @Length(6,6)
    @IsString()
    otp:string;
}
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class EnterCHatDto {

    @IsNumber()
    senderId:number;
}

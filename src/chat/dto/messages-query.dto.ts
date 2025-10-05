import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class MessagesQueryDto {
    @IsOptional()
    @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
    @IsNumber()
    page: number;

    @IsOptional()
    @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
    @IsNumber()
    limit: number;
}

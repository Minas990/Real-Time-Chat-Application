import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as nodemailer from 'nodemailer'
import { sendEmailDto } from './dto/send-email.dto';


@Injectable()
export class EmailService 
{
    constructor(private readonly configService: ConfigService) {}
    private makeTransporter() {
        const transport = nodemailer.createTransport({
            host:this.configService.get<string>('EMAIL_HOST'),
            port:this.configService.get<number>('EMAIL_PORT'),
            auth: {
                user:this.configService.get<string>('EMAIL_USERNAME'),
                pass:this.configService.get<string>('EMAIL_PASSWORD')
            }
        });
        return transport;
    }
    async sendEmail(dto:sendEmailDto) : Promise<void>
    {
        const {user,text,subject}  = dto;
        const transport = this.makeTransporter();

        const options : nodemailer.SendMailOptions =
        {
            from:this.configService.get<string>('EMAIL_ADMIN'),
            to:user,
            subject,
            text
        };
        try
        {
            await transport.sendMail(options);
            console.log(`send with success`);
        }
        catch(err)
        {
            console.log(`something unusual happened!! ${err.message}`);
        }
    }

}

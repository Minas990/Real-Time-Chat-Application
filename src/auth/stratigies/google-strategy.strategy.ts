import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback ,StrategyOptions, Profile} from 'passport-google-oauth20';
import { UserService } from "src/user/user.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy,'google')
{
    constructor(private configService: ConfigService,private userService:UserService) {
        super({
            clientID: configService.get<string>("GOOGLE_CLIENT_ID"),
            clientSecret: configService.get<string>("GOOGLE_CLIENT_PASSWORD"),
            callbackURL: configService.get<string>("GOOGLE_REDIRECT_URL"),
            scope: ["email", "profile"],
            
        } as StrategyOptions);
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ): Promise<any> {
        //we dont need any tokens as we will not make any api call to google : ) 
        if(!profile.emails)
            throw new InternalServerErrorException('some wrong while fetching data from google try again!');
        const {value , verified} = profile.emails[0] ;
        if(!verified)
            throw new ForbiddenException('ur google email isnt verified yet!');
        done(null,profile._json);
    }
}
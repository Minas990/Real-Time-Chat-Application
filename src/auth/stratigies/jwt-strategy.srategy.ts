import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "../../user/user.service";

@Injectable()

export class JwtStrategy extends PassportStrategy(Strategy)
{
    constructor(private userService:UserService) {
        super(
            {
                jwtFromRequest:ExtractJwt.fromExtractors([
                    (req) => {
                        if(req?.headers?.authorization)
                            return req.headers.authorization.replace('Bearer ', ''); 
                        if (req?.handshake?.headers?.authorization) 
                            return req.handshake.headers.authorization.replace('Bearer ', '');
                        return null;
                    }
                ]),
                ignoreExpiration:false,
                secretOrKey: process.env.JWT_SECRET|| "ur SECRET KEY"
            }
        );
        
    }
    async validate(payload:any) 
    {
        try
        {
            const user = await this.userService.findOneUser(payload.id);
            if(user.passwordChangedAt)
            {
                const changedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
                if(payload.iat < changedTimestamp)
                {
                    throw new UnauthorizedException('old token');
                }
            }
            return user;
        }
        catch(err)
        {
            throw new UnauthorizedException(err.message);
        }
    }
    
}
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { UserRole } from "../entites/user.entity";
import { ROLE_KEY } from "../../auth/decorators/roles.decorator";

@Injectable()

export class IsAdminGuard implements CanActivate
{
    constructor(private readonly reflector:Reflector){}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> 
    {
        const roles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLE_KEY,[
                context.getHandler(),
                context.getClass()
            ]
        );
        if(!roles)
            return true;
        const user = context.switchToHttp().getRequest().user;
        if(!user)
            throw new UnauthorizedException('log in first plz');
        const is_authorized =  roles.includes(user.role);
        if(!is_authorized) throw new UnauthorizedException('normal users out !!');
        return true;
    }
}


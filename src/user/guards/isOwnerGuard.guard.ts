import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { UserEntity } from "../entites/user.entity";

export class IsOwnerGuard implements CanActivate
{
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> 
    {
        const req = context.switchToHttp().getRequest();
        const user:UserEntity = req.user;
        const id:number = +(req.params.id);
        if(user.id!=id)
            throw new UnauthorizedException('edit only ur owns plz :) ');
        return true;
    }
}
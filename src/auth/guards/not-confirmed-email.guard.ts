import { BadRequestException, CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";


export class NotConfirmedEmail implements CanActivate
{
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const user = context.switchToHttp().getRequest().user;
        if(user.confirmEmail)
            throw new BadRequestException('already the email is confirmed !!');
        return true;
    }
}
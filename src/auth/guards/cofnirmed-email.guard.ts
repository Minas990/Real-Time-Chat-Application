import { BadRequestException, CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";


export class ConfirmedEmail implements CanActivate
{
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const user = context.switchToHttp().getRequest().user;
        if(!user.confirmEmail)
            throw new BadRequestException('confirm ur email first plz');
        return true;
    }
}
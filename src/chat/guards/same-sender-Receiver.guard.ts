import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { Socket } from "socket.io";


@Injectable()
export class PreventSelfMessageGuard implements CanActivate
{
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const client:Socket = context.switchToWs().getClient();
        const data = context.switchToWs().getData();//kinda the body

        const senderId = client.data?.user?.id;
        const receiverId = data?.receiverId;
        
        if(!senderId || !receiverId)
            return false;

        if(senderId==receiverId)
            return false;
        return true;
    }
}
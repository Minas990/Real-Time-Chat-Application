import { IsNotEmpty, IsNumber } from "class-validator";
import { RequestStatus } from "../entities/friend-request.entity";


export class AcceptFriendRequestDto
{
    @IsNumber()
    @IsNotEmpty()
    friendRequestId:number;

    @IsNotEmpty()
    newStatus:Exclude<RequestStatus,RequestStatus.PENDING>
}
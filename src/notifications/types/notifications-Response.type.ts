import { NOTIFICATIONSTYPES } from "../entities/notifications.entity";

export interface NotificationsResponse
{
    id:number;
    emitter:number;
    createdAt:Date;
    type:NOTIFICATIONSTYPES,
    contentId:number;
}
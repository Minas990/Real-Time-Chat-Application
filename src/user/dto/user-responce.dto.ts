import { Expose } from "class-transformer";
import { Status } from "../entites/user.entity";

export class UserResponsDto 
{
    @Expose()
    id:number;
    @Expose()
    username:string;
    @Expose()
    name:string;
    @Expose()
    profileImage:string;
    @Expose()
    state:Status;
    
}
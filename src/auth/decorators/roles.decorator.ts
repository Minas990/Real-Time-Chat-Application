import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../../user/entites/user.entity";


export const ROLE_KEY = 'role';
export const ROLES = (...args:UserRole[]) => SetMetadata(ROLE_KEY,args);


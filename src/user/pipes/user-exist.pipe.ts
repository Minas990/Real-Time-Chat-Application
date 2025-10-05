import { ArgumentMetadata, Injectable, NotFoundException, PipeTransform } from "@nestjs/common";
import { UserService } from "../user.service";


@Injectable()

export class UserExistPipe implements PipeTransform
{
    constructor(private readonly userService:UserService) {}
    async transform(value: string, metadata: ArgumentMetadata) 
    {
        try
        {
            const id = +value;
            const user = await this.userService.findOneUser(id);
            return user;
        }
        catch(err)
        {
            throw new NotFoundException('no such user');
        }
    }
}

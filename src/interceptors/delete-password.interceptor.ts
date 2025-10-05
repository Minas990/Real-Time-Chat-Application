import { CallHandler, ExecutionContext, NestInterceptor, UseInterceptors } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { Observable } from "rxjs";
import {  map } from "rxjs/operators";


interface ClassConsuctor
{
    new (...args:any[]): {}
}

export function Serialize(dto:ClassConsuctor) {
    return UseInterceptors(new DeletePasswordInterceptor(dto));
}

export class DeletePasswordInterceptor implements NestInterceptor
{
    constructor(private dto:any) {} 
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any>  {
        return next.handle().pipe(
            map((data:any) => {
                return plainToInstance(this.dto,data,{excludeExtraneousValues:true});
            })
        )
    }
}
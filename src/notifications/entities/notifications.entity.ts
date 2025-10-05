import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import {Status as NotificationsStatus} from '../../common/status';
import { UserEntity } from "src/user/entites/user.entity";

export enum NOTIFICATIONSTYPES{
    MESSAGE='message',
    FRIEND_REQUEST='friend_request',
    NEW_FRIEND='friend'
}

@Entity()
@Index(['senderId', 'receiverId']) 

export class NotificationsEntity
{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    senderId: number;

    @Column()
    receiverId: number;

    @Column({
        type: 'enum',
        enum: NotificationsStatus,
        default: NotificationsStatus.SENT
    })
    status: NotificationsStatus;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => UserEntity,{eager:true})
    @JoinColumn({name:'senderId'})
    sender:UserEntity;

    @ManyToOne(() => UserEntity,{eager:true})
    @JoinColumn({name:'receiverId'})
    receiver:UserEntity;

    @Column({
        type: 'enum',
        enum: NOTIFICATIONSTYPES,
    })
    type:NOTIFICATIONSTYPES;

    @Column()
    contentId:number;// *not the best make* 
}
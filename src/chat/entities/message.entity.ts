import { UserEntity } from "src/user/entites/user.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import {Status as MessageStatus} from '../../common/status';


@Entity('message')
@Index(['senderId', 'receiverId']) 
export class MessageEntity
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    content: string;

    @Column()
    senderId: number;

    @Column()
    receiverId: number;

    @Column({
        type: 'enum',
        enum: MessageStatus,
        default: MessageStatus.SENT
    })
    status: MessageStatus;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    deliveredAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    readAt: Date;

    @ManyToOne(() => UserEntity, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({name:'senderId'})
    sender: UserEntity;

    @ManyToOne(() => UserEntity, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({name:'receiverId'})
    receiver: UserEntity;

}
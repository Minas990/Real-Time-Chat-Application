import { UserEntity } from "src/user/entites/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, Index, Unique } from "typeorm";

export enum RequestStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED'
}

@Entity('friend_requests')
@Index(['receiverId'])
@Unique(['senderId', 'receiverId'])

export class FriendRequestEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    senderId: number;

    @Column()
    receiverId: number;

    @ManyToOne(() => UserEntity, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'senderId' })
    sender: UserEntity;

    @ManyToOne(() => UserEntity, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'receiverId' })
    receiver: UserEntity;

    @Column({
        type: 'enum',
        enum: RequestStatus,
        default: RequestStatus.PENDING
    })
    status: RequestStatus;

    @CreateDateColumn()
    createdAt: Date;
}

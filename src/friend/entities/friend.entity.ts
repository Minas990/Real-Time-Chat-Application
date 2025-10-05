import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, CreateDateColumn, BeforeInsert, Index } from "typeorm";
import { UserEntity } from "src/user/entites/user.entity";

@Entity('friends')
@Unique(['user1Id', 'user2Id'])
@Index(['user2Id','user1Id'])
export class FriendEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user1Id: number;

    @Column()
    user2Id: number;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user1Id' })
    user1: UserEntity;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user2Id' })
    user2: UserEntity;

    @CreateDateColumn()
    createdAt: Date;

    // ensure user1Id < user2Id before saving
    @BeforeInsert()
    normalizeOrder() 
    {
        if (this.user1Id > this.user2Id) 
        {
            [this.user1Id, this.user2Id] = [this.user2Id, this.user1Id];
        }
    }
}

import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user'
}

export enum Status {
    OFFLINE = 'OFFLINE',
    ONLINE = 'ONLINE'
}

@Entity()
@Unique('username_unique',['username'] )
@Unique('email_unique',['email'])
export class UserEntity
{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    name:string;


    @Column()
    email:string;

    @Column()
    password:string;

    @Column()
    username:string;

    @Column({default:false})
    confirmEmail:boolean;

    @Column({
        type:'enum',
        enum:UserRole,
        default:UserRole.USER
    })
    role:UserRole;

    @CreateDateColumn()
    createdAt:Date;

    @Column({ nullable: true })
    OTP:string ;

    @Column({ nullable: true })
    OTPExpiresAt:Date ;

    @Column({
        default:'default'
    })
    profileImage:string;

    @Column({nullable:true})
    passwordChangedAt:Date ;

    @Column({ type: 'varchar', nullable: true })
    passwordResetToken:string | null;

    @Column({ type: 'timestamp', nullable: true })
    passwordResetTokenExpiresAt:Date | null;

    @Column({
        type:'enum',
        enum: Status,
        default:Status.OFFLINE
    })
    state:Status;

    
}

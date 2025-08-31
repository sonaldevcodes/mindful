import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { PostEntity } from '../../posts/entities/post.entity';
import { LikeStatus } from '../likes.status.enum';

@Entity('likes')
export class LikeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: LikeStatus, default: LikeStatus.LIKE })
  status: LikeStatus;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => PostEntity)
  @JoinColumn({ name: 'postId' })
  post: PostEntity;

  @Column({ type: 'int' })
  targetId: number; // Will be either postId or commentId

  @Column({ type: 'varchar' })
  type: string; // 'POST' or 'COMMENT'
}

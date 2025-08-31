import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { PostEntity } from '../../posts/entities/post.entity';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { NestedCommentEntity } from './nested-comment.entity';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column()
  userId: number;  // Reference to the user who created the comment

  @Column()
  postId: number;  // Reference to the post this comment is on

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.comments)
  @JoinColumn({ name: 'postId' })
  post: PostEntity;

  @OneToMany(() => NestedCommentEntity, (nestedComment) => nestedComment.comment, { cascade: true })
  nestedComments: NestedCommentEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

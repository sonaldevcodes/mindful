import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
  } from 'typeorm';
  import { CommentEntity } from './comment.entity';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';

  @Entity('nested_comments')
  export class NestedCommentEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column('text')
    content: string;
  
    @Column()
    userId: number;  // Reference to the user who created the nested comment
  
    @Column()
    commentId: number;  // Reference to the parent comment
  
    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'userId' })
    user: UserEntity;
  
    @ManyToOne(() => CommentEntity, (comment) => comment.nestedComments)
    @JoinColumn({ name: 'commentId' })
    comment: CommentEntity;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  
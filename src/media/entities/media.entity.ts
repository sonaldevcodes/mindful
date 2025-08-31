// src/media/entities/media.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { PostEntity } from '../../posts/entities/post.entity';

@Entity('media')
export class MediaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  @Column()
  type: 'image' | 'video' | 'document';

  @Column({ nullable: true })
  postId?: number;

  @Column({ nullable: true })
  userId?: number;

  @ManyToOne(() => PostEntity, post => post.media)
  @JoinColumn({ name: 'postId' })
  post?: PostEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

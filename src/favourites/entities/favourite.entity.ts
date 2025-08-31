import { Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class FavoriteEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'The unique identifier of the favorite entity.' })
  id: number;

  @ApiProperty({ type: () => UserEntity, description: 'The user who favorited another user.' })
  @ManyToOne(() => UserEntity, (user) => user.favorites)
  @JoinColumn({ name: 'userId' })  // Assuming a join column for clarity
  user: UserEntity;

  @ApiProperty({ type: () => UserEntity, description: 'The user who is being favorited.' })
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'favoritedUserId' })  // Assuming a join column for clarity
  favoritedUser: UserEntity;
}

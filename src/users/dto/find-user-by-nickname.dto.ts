import { IsString, IsNotEmpty } from 'class-validator';

export class FindUserByNicknameDto {
  @IsString()
  nickName: string;
}

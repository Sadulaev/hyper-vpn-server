import { IsString } from 'class-validator';

export class AddUserDto {
  @IsString() id: string;
  @IsString() name: string;
  @IsString() tgName: string;
  @IsString() invitesId: string;
  @IsString() enterDate: string;
}
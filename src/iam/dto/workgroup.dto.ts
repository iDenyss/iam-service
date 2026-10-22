import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateWorkgroupDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del grupo es obligatorio' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class AddUserToWorkgroupDto {
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  @IsNotEmpty()
  userId: string;
}
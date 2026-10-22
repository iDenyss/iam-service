import { IsUUID, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class AssignRoleDto {
  @IsUUID('4', { message: 'El roleId debe ser un UUID válido' })
  @IsNotEmpty()
  roleId: string;
}
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del permiso es obligatorio' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdatePermissionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class AssignPermissionToUserDto {
  @IsUUID('4', { message: 'El permissionId debe ser un UUID válido' })
  @IsNotEmpty()
  permissionId: string;
}

export class AssignPermissionToRoleDto {
  @IsUUID('4', { message: 'El permissionId debe ser un UUID válido' })
  @IsNotEmpty()
  permissionId: string;
}
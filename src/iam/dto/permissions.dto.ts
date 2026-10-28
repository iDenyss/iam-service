import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'WORKSPACE_CREATE', description: 'Nombre del permiso' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del permiso es obligatorio' })
  name: string;

  @ApiPropertyOptional({ example: 'Crear workspace', description: 'Descripción del permiso' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdatePermissionDto {
  @ApiPropertyOptional({ example: 'WORKSPACE_CREATE', description: 'Nombre del permiso' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Crear workspace', description: 'Descripción del permiso' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class AssignPermissionToUserDto {
  @ApiProperty({ example: 'e7a62f43-9b32-4c8d-b02a-8ab7e9432d51', description: 'UUID del permiso a asignar' })
  @IsUUID('4', { message: 'El permissionId debe ser un UUID válido' })
  @IsNotEmpty()
  permissionId: string;
}

export class AssignPermissionToRoleDto {
  @ApiProperty({ example: 'e7a62f43-9b32-4c8d-b02a-8ab7e9432d51', description: 'UUID del permiso a asignar' })
  @IsUUID('4', { message: 'El permissionId debe ser un UUID válido' })
  @IsNotEmpty()
  permissionId: string;
}
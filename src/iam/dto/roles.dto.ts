import { IsUUID, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'ADMIN', description: 'Nombre del rol' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Administrador del sistema', description: 'Descripción del rol' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class AssignRoleDto {
  @ApiProperty({ example: 'e7a62f43-9b32-4c8d-b02a-8ab7e9432d51', description: 'UUID del rol a asignar' })
  @IsUUID('4', { message: 'El roleId debe ser un UUID válido' })
  @IsNotEmpty()
  roleId: string;
}
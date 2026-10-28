import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkgroupDto {
  @ApiProperty({ example: 'Desarrollo', description: 'Nombre del grupo de trabajo' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del grupo es obligatorio' })
  name: string;

  @ApiPropertyOptional({ example: 'Equipo de desarrollo', description: 'Descripción del grupo de trabajo' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class AddUserToWorkgroupDto {
  @ApiProperty({ example: 'e7a62f43-9b32-4c8d-b02a-8ab7e9432d51', description: 'UUID del usuario a agregar' })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  @IsNotEmpty()
  userId: string;
}
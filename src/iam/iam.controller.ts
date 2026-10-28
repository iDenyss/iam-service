// src/iam/iam.controller.ts
import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { IamService } from './iam.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateRoleDto, AssignRoleDto } from './dto/roles.dto';
import { CreateWorkgroupDto, AddUserToWorkgroupDto } from './dto/workgroup.dto';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  AssignPermissionToUserDto,
  AssignPermissionToRoleDto,
} from './dto/permissions.dto';

@ApiTags('IAM')
@Controller('iam')
export class IamController {
  constructor(private readonly iamService: IamService) {}

  // ==============================
  // 1. AUTENTICACIÓN Y USUARIOS
  // ==============================

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'El usuario ya existe' })
  register(@Body() dto: RegisterDto) {
    return this.iamService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso, retorna token JWT' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas o cuenta deshabilitada' })
  login(@Body() dto: LoginDto) {
    return this.iamService.login(dto);
  }

  @Get('users')
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios con roles y permisos directos' })
  findAllUsers() {
    return this.iamService.findAll();
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 400, description: 'Correo ya registrado por otro usuario' })
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.iamService.updateUser(id, dto);
  }

  @Patch('users/:id/deactivate')
  @ApiOperation({ summary: 'Desactivar usuario' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario desactivado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  deactivateUser(@Param('id') id: string) {
    return this.iamService.deactivateUser(id);
  }

  @Patch('users/:id/activate')
  @ApiOperation({ summary: 'Activar usuario' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario activado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  activateUser(@Param('id') id: string) {
    return this.iamService.activateUser(id);
  }

  // ==============================
  // 2. ROLES
  // ==============================

  @Post('roles')
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
  createRole(@Body() dto: CreateRoleDto) {
    return this.iamService.createRole(dto);
  }

  @Get('roles')
  @ApiOperation({ summary: 'Obtener todos los roles' })
  @ApiResponse({ status: 200, description: 'Lista de roles con sus permisos' })
  findAllRoles() {
    return this.iamService.findAllRoles();
  }

  @Patch('roles/:id/deactivate')
  @ApiOperation({ summary: 'Desactivar rol' })
  @ApiParam({ name: 'id', description: 'UUID del rol' })
  @ApiResponse({ status: 200, description: 'Rol desactivado exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  deactivateRole(@Param('id') id: string) {
    return this.iamService.deactivateRole(id);
  }

  @Patch('roles/:id/activate')
  @ApiOperation({ summary: 'Activar rol' })
  @ApiParam({ name: 'id', description: 'UUID del rol' })
  @ApiResponse({ status: 200, description: 'Rol activado exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  activateRole(@Param('id') id: string) {
    return this.iamService.activateRole(id);
  }

  @Post('users/:id/roles')
  @ApiOperation({ summary: 'Asignar rol a un usuario' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({ status: 201, description: 'Rol asignado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario o rol no encontrado' })
  @ApiResponse({ status: 400, description: 'Rol deshabilitado o ya asignado' })
  assignRole(@Param('id') userId: string, @Body() dto: AssignRoleDto) {
    return this.iamService.assignRoleToUser(userId, dto);
  }

  @Delete('users/:userId/roles/:roleId')
  @ApiOperation({ summary: 'Remover rol de un usuario' })
  @ApiParam({ name: 'userId', description: 'UUID del usuario' })
  @ApiParam({ name: 'roleId', description: 'UUID del rol' })
  @ApiResponse({ status: 200, description: 'Rol removido exitosamente' })
  removeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.iamService.removeRoleFromUser(userId, roleId);
  }

  // ==============================
  // 3. PERMISOS
  // ==============================

  @Get('permissions')
  @ApiOperation({ summary: 'Obtener todos los permisos' })
  @ApiResponse({ status: 200, description: 'Lista de permisos' })
  findAllPermissions() {
    return this.iamService.findAllPermissions();
  }

  @Post('permissions/seed')
  @ApiOperation({ summary: 'Sembrar permisos del sistema (28 permisos predefinidos)' })
  @ApiResponse({ status: 201, description: 'Permisos sembrados exitosamente' })
  seedPermissions() {
    return this.iamService.seedSystemPermissions();
  }

  @Post('permissions')
  @ApiOperation({ summary: 'Crear un nuevo permiso' })
  @ApiResponse({ status: 201, description: 'Permiso creado exitosamente' })
  @ApiResponse({ status: 400, description: 'El permiso ya existe' })
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.iamService.createPermission(dto);
  }

  @Patch('permissions/:id')
  @ApiOperation({ summary: 'Actualizar permiso' })
  @ApiParam({ name: 'id', description: 'UUID del permiso' })
  @ApiResponse({ status: 200, description: 'Permiso actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  updatePermission(
    @Param('id') id: string,
    @Body() dto: UpdatePermissionDto,
  ) {
    return this.iamService.updatePermission(id, dto);
  }

  @Patch('permissions/:id/deactivate')
  @ApiOperation({ summary: 'Desactivar permiso' })
  @ApiParam({ name: 'id', description: 'UUID del permiso' })
  @ApiResponse({ status: 200, description: 'Permiso desactivado exitosamente' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  deactivatePermission(@Param('id') id: string) {
    return this.iamService.deactivatePermission(id);
  }

  @Patch('permissions/:id/activate')
  @ApiOperation({ summary: 'Activar permiso' })
  @ApiParam({ name: 'id', description: 'UUID del permiso' })
  @ApiResponse({ status: 200, description: 'Permiso activado exitosamente' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  activatePermission(@Param('id') id: string) {
    return this.iamService.activatePermission(id);
  }

  @Post('users/:id/permissions')
  @ApiOperation({ summary: 'Asignar permiso directo a un usuario' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({ status: 201, description: 'Permiso asignado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario o permiso no encontrado' })
  @ApiResponse({ status: 400, description: 'Permiso deshabilitado o ya asignado' })
  assignPermissionToUser(
    @Param('id') userId: string,
    @Body() dto: AssignPermissionToUserDto,
  ) {
    return this.iamService.assignPermissionToUser(userId, dto);
  }

  @Delete('users/:userId/permissions/:permissionId')
  @ApiOperation({ summary: 'Remover permiso directo de un usuario' })
  @ApiParam({ name: 'userId', description: 'UUID del usuario' })
  @ApiParam({ name: 'permissionId', description: 'UUID del permiso' })
  @ApiResponse({ status: 200, description: 'Permiso removido exitosamente' })
  removePermissionFromUser(
    @Param('userId') userId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.iamService.removePermissionFromUser(userId, permissionId);
  }

  @Post('roles/:id/permissions')
  @ApiOperation({ summary: 'Asignar permiso a un rol' })
  @ApiParam({ name: 'id', description: 'UUID del rol' })
  @ApiResponse({ status: 201, description: 'Permiso asignado al rol exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol o permiso no encontrado' })
  @ApiResponse({ status: 400, description: 'Permiso deshabilitado o ya asignado' })
  assignPermissionToRole(
    @Param('id') roleId: string,
    @Body() dto: AssignPermissionToRoleDto,
  ) {
    return this.iamService.assignPermissionToRole(roleId, dto);
  }

  @Delete('roles/:roleId/permissions/:permissionId')
  @ApiOperation({ summary: 'Remover permiso de un rol' })
  @ApiParam({ name: 'roleId', description: 'UUID del rol' })
  @ApiParam({ name: 'permissionId', description: 'UUID del permiso' })
  @ApiResponse({ status: 200, description: 'Permiso removido exitosamente' })
  removePermissionFromRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.iamService.removePermissionFromRole(roleId, permissionId);
  }

  // ==============================
  // 4. GRUPOS DE TRABAJO (WORKGROUPS)
  // ==============================

  @Post('workgroups')
  @ApiOperation({ summary: 'Crear un nuevo grupo de trabajo' })
  @ApiResponse({ status: 201, description: 'Grupo de trabajo creado exitosamente' })
  createWorkgroup(@Body() dto: CreateWorkgroupDto) {
    return this.iamService.createWorkgroup(dto);
  }

  @Get('workgroups')
  @ApiOperation({ summary: 'Obtener todos los grupos de trabajo' })
  @ApiResponse({ status: 200, description: 'Lista de grupos de trabajo con sus miembros' })
  findAllWorkgroups() {
    return this.iamService.findAllWorkgroups();
  }

  @Post('workgroups/:id/members')
  @ApiOperation({ summary: 'Agregar usuario a un grupo de trabajo' })
  @ApiParam({ name: 'id', description: 'UUID del grupo de trabajo' })
  @ApiResponse({ status: 201, description: 'Usuario agregado exitosamente' })
  @ApiResponse({ status: 404, description: 'Grupo de trabajo o usuario no encontrado' })
  @ApiResponse({ status: 400, description: 'Usuario ya pertenece al grupo' })
  addUserToWorkgroup(
    @Param('id') workgroupId: string,
    @Body() dto: AddUserToWorkgroupDto,
  ) {
    return this.iamService.addUserToWorkgroup(workgroupId, dto);
  }

  @Delete('workgroups/:workgroupId/members/:userId')
  @ApiOperation({ summary: 'Remover usuario de un grupo de trabajo' })
  @ApiParam({ name: 'workgroupId', description: 'UUID del grupo de trabajo' })
  @ApiParam({ name: 'userId', description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario removido exitosamente' })
  removeUserFromWorkgroup(
    @Param('workgroupId') workgroupId: string,
    @Param('userId') userId: string,
  ) {
    return this.iamService.removeUserFromWorkgroup(workgroupId, userId);
  }
}
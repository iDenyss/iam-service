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

@Controller('iam')
export class IamController {
  constructor(private readonly iamService: IamService) {}

  // ==============================
  // 1. AUTENTICACIÓN Y USUARIOS
  // ==============================

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.iamService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.iamService.login(dto);
  }

  @Get('users')
  findAllUsers() {
    return this.iamService.findAll();
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.iamService.updateUser(id, dto);
  }

  @Patch('users/:id/deactivate')
  deactivateUser(@Param('id') id: string) {
    return this.iamService.deactivateUser(id);
  }

  @Patch('users/:id/activate')
  activateUser(@Param('id') id: string) {
    return this.iamService.activateUser(id);
  }

  // ==============================
  // 2. ROLES
  // ==============================

  @Post('roles')
  createRole(@Body() dto: CreateRoleDto) {
    return this.iamService.createRole(dto);
  }

  @Get('roles')
  findAllRoles() {
    return this.iamService.findAllRoles();
  }

  @Patch('roles/:id/deactivate')
  deactivateRole(@Param('id') id: string) {
    return this.iamService.deactivateRole(id);
  }

  @Patch('roles/:id/activate')
  activateRole(@Param('id') id: string) {
    return this.iamService.activateRole(id);
  }

  @Post('users/:id/roles')
  assignRole(@Param('id') userId: string, @Body() dto: AssignRoleDto) {
    return this.iamService.assignRoleToUser(userId, dto);
  }

  @Delete('users/:userId/roles/:roleId')
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
  findAllPermissions() {
    return this.iamService.findAllPermissions();
  }

  @Post('permissions/seed')
  seedPermissions() {
    return this.iamService.seedSystemPermissions();
  }

  @Post('permissions')
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.iamService.createPermission(dto);
  }

  @Patch('permissions/:id')
  updatePermission(
    @Param('id') id: string,
    @Body() dto: UpdatePermissionDto,
  ) {
    return this.iamService.updatePermission(id, dto);
  }

  @Patch('permissions/:id/deactivate')
  deactivatePermission(@Param('id') id: string) {
    return this.iamService.deactivatePermission(id);
  }

  @Patch('permissions/:id/activate')
  activatePermission(@Param('id') id: string) {
    return this.iamService.activatePermission(id);
  }

  @Post('users/:id/permissions')
  assignPermissionToUser(
    @Param('id') userId: string,
    @Body() dto: AssignPermissionToUserDto,
  ) {
    return this.iamService.assignPermissionToUser(userId, dto);
  }

  @Delete('users/:userId/permissions/:permissionId')
  removePermissionFromUser(
    @Param('userId') userId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.iamService.removePermissionFromUser(userId, permissionId);
  }

  @Post('roles/:id/permissions')
  assignPermissionToRole(
    @Param('id') roleId: string,
    @Body() dto: AssignPermissionToRoleDto,
  ) {
    return this.iamService.assignPermissionToRole(roleId, dto);
  }

  @Delete('roles/:roleId/permissions/:permissionId')
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
  createWorkgroup(@Body() dto: CreateWorkgroupDto) {
    return this.iamService.createWorkgroup(dto);
  }

  @Get('workgroups')
  findAllWorkgroups() {
    return this.iamService.findAllWorkgroups();
  }

  @Post('workgroups/:id/members')
  addUserToWorkgroup(
    @Param('id') workgroupId: string,
    @Body() dto: AddUserToWorkgroupDto,
  ) {
    return this.iamService.addUserToWorkgroup(workgroupId, dto);
  }

  @Delete('workgroups/:workgroupId/members/:userId')
  removeUserFromWorkgroup(
    @Param('workgroupId') workgroupId: string,
    @Param('userId') userId: string,
  ) {
    return this.iamService.removeUserFromWorkgroup(workgroupId, userId);
  }
}
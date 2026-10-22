// src/iam/iam.controller.ts
import { Controller, Post, Body, Patch, Param, Get, Delete } from '@nestjs/common';
import { IamService } from './iam.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateRoleDto, AssignRoleDto } from './dto/roles.dto';
import { CreateWorkgroupDto, AddUserToWorkgroupDto } from './dto/workgroup.dto';

@Controller('iam')
export class IamController {
  constructor(private readonly iamService: IamService) {}

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

  // DESHABILITAR
  @Patch('users/:id/deactivate')
  deactivateUser(@Param('id') id: string) {
    return this.iamService.deactivateUser(id);
  }

  // REACTIVAR
  @Patch('users/:id/activate')
  activateUser(@Param('id') id: string) {
    return this.iamService.activateUser(id);
  }

  // ROLES
  @Post('roles')
  createRole(@Body() dto: CreateRoleDto) {
    return this.iamService.createRole(dto);
  }

  @Get('roles')
  findAllRoles() {
    return this.iamService.findAllRoles();
  }

  @Post('users/:id/roles')
  assignRole(@Param('id') userId: string, @Body() dto: AssignRoleDto) {
    return this.iamService.assignRoleToUser(userId, dto);
  }

  // GRUPOS DE TRABAJO
  @Post('workgroups')
  createWorkgroup(@Body() dto: CreateWorkgroupDto) {
    return this.iamService.createWorkgroup(dto);
  }

  @Get('workgroups')
  findAllWorkgroups() {
    return this.iamService.findAllWorkgroups();
  }

  @Post('workgroups/:id/members')
  addUserToWorkgroup(@Param('id') workgroupId: string, @Body() dto: AddUserToWorkgroupDto) {
    return this.iamService.addUserToWorkgroup(workgroupId, dto);
  }
}
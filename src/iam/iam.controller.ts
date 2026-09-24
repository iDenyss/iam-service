// src/iam/iam.controller.ts
import { Controller, Post, Body, Patch, Delete, Param, Get } from '@nestjs/common';
import { IamService } from './iam.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
  findAll() {
    return this.iamService.findAll();
  }

  // PATCH /iam/users/:id
  @Patch('users/:id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.iamService.updateUser(id, dto);
  }

  // DELETE /iam/users/:id
  @Delete('users/:id')
  remove(@Param('id') id: string) {
    return this.iamService.deleteUser(id);
  }
}
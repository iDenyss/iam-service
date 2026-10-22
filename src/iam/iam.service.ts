import { Injectable, Inject, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as bcrypt from 'bcrypt';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../database/schema';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateRoleDto, AssignRoleDto } from './dto/roles.dto';
import { CreateWorkgroupDto, AddUserToWorkgroupDto } from './dto/workgroup.dto';

@Injectable()
export class IamService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.db.query.users.findFirst({
      where: eq(schema.users.email, dto.email),
    });

    if (existing) {
      throw new BadRequestException('El usuario con este correo ya existe');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const [newUser] = await this.db
      .insert(schema.users)
      .values({
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        isActive: true,
      })
      .returning();

    return {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, dto.email),
      with: {
        usersToRoles: {
          with: {
            role: true,
          },
        },
      },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Esta cuenta ha sido deshabilitada. Contacte al administrador');
    }

    const userRoles = user.usersToRoles?.map((ur) => ur.role.name) || [];

    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: userRoles,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async findAll() {
    const allUsers = await this.db.query.users.findMany({
      columns: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        createdAt: true,
      },
      with: {
        usersToRoles: {
          with: {
            role: true,
          },
        },
      },
    });

    return allUsers.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      isActive: u.isActive,
      roles: u.usersToRoles?.map((ur) => ur.role.name) || [],
      createdAt: u.createdAt,
    }));
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const updateData: Record<string, any> = { updatedAt: new Date() };

    if (dto.email) {
      const existingEmail = await this.db.query.users.findFirst({
        where: eq(schema.users.email, dto.email),
      });

      if (existingEmail && existingEmail.id !== id) {
        throw new BadRequestException('Ese correo ya está registrado por otro usuario');
      }
      updateData.email = dto.email;
    }

    if (dto.fullName) {
      updateData.fullName = dto.fullName;
    }

    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const [updatedUser] = await this.db
      .update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, id))
      .returning({
        id: schema.users.id,
        email: schema.users.email,
        fullName: schema.users.fullName,
        isActive: schema.users.isActive,
        updatedAt: schema.users.updatedAt,
      });

    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return updatedUser;
  }

  async deactivateUser(id: string) {
    const [user] = await this.db
      .update(schema.users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning({ id: schema.users.id, isActive: schema.users.isActive });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return { message: `Usuario ${id} ha sido deshabilitado correctamente` };
  }

  async activateUser(id: string) {
    const [user] = await this.db
      .update(schema.users)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning({ id: schema.users.id, isActive: schema.users.isActive });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return { message: `Usuario ${id} ha sido reactivado exitosamente` };
  }

  async createRole(dto: CreateRoleDto) {
    const [role] = await this.db
      .insert(schema.roles)
      .values({ name: dto.name.toUpperCase(), description: dto.description })
      .returning();
    return role;
  }

  async findAllRoles() {
    return this.db.query.roles.findMany();
  }

  async assignRoleToUser(userId: string, dto: AssignRoleDto) {
    const user = await this.db.query.users.findFirst({ where: eq(schema.users.id, userId) });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const role = await this.db.query.roles.findFirst({ where: eq(schema.roles.id, dto.roleId) });
    if (!role) throw new NotFoundException('Rol no encontrado');

    const existing = await this.db.query.usersToRoles.findFirst({
      where: and(eq(schema.usersToRoles.userId, userId), eq(schema.usersToRoles.roleId, dto.roleId)),
    });

    if (existing) {
      throw new BadRequestException('El usuario ya tiene asignado este rol');
    }

    await this.db.insert(schema.usersToRoles).values({
      userId,
      roleId: dto.roleId,
    });

    return { message: `Rol ${role.name} asignado al usuario exitosamente` };
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    await this.db
      .delete(schema.usersToRoles)
      .where(and(eq(schema.usersToRoles.userId, userId), eq(schema.usersToRoles.roleId, roleId)));

    return { message: 'Rol removido del usuario correctamente' };
  }

  async createWorkgroup(dto: CreateWorkgroupDto) {
    const [workgroup] = await this.db
      .insert(schema.workgroups)
      .values({ name: dto.name, description: dto.description })
      .returning();
    return workgroup;
  }

  async findAllWorkgroups() {
    return this.db.query.workgroups.findMany({
      with: {
        usersToWorkgroups: {
          with: {
            user: {
              columns: { id: true, email: true, fullName: true, isActive: true },
            },
          },
        },
      },
    });
  }

  async addUserToWorkgroup(workgroupId: string, dto: AddUserToWorkgroupDto) {
    const workgroup = await this.db.query.workgroups.findFirst({ where: eq(schema.workgroups.id, workgroupId) });
    if (!workgroup) throw new NotFoundException('Grupo de trabajo no encontrado');

    const user = await this.db.query.users.findFirst({ where: eq(schema.users.id, dto.userId) });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const existing = await this.db.query.usersToWorkgroups.findFirst({
      where: and(eq(schema.usersToWorkgroups.userId, dto.userId), eq(schema.usersToWorkgroups.workgroupId, workgroupId)),
    });

    if (existing) {
      throw new BadRequestException('El usuario ya pertenece a este grupo de trabajo');
    }

    await this.db.insert(schema.usersToWorkgroups).values({
      userId: dto.userId,
      workgroupId,
    });

    return { message: `Usuario agregado al grupo "${workgroup.name}" correctamente` };
  }

  async removeUserFromWorkgroup(workgroupId: string, userId: string) {
    await this.db
      .delete(schema.usersToWorkgroups)
      .where(and(eq(schema.usersToWorkgroups.userId, userId), eq(schema.usersToWorkgroups.workgroupId, workgroupId)));

    return { message: 'Usuario removido del grupo de trabajo' };
  }
}
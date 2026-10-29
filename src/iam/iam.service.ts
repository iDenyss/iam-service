// src/iam/iam.service.ts
import {
  Injectable,
  Inject,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  AssignPermissionToUserDto,
  AssignPermissionToRoleDto,
} from './dto/permissions.dto';

@Injectable()
export class IamService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
    private readonly jwtService: JwtService,
  ) {}

  // ==========================================
  // 1. AUTENTICACIÓN Y USUARIOS
  // ==========================================

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (existing) {
      throw new BadRequestException('El usuario con este correo ya existe');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const [newUser] = await this.db
      .insert(schema.users)
      .values({
        email,
        passwordHash,
        fullName: dto.fullName.trim(),
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
    const email = dto.email.trim().toLowerCase();
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
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
      throw new UnauthorizedException(
        'Esta cuenta ha sido deshabilitada. Contacte al administrador',
      );
    }

    const role =
      user.usersToRoles?.find((ur) => ur.role.isActive)?.role.name ?? 'MEMBER';

    const payload = {
      id: user.id,
      email: user.email,
      role,
      fullName: user.fullName,
      full_name: user.fullName,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h',
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role,
        fullName: user.fullName,
      },
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
        usersToPermissions: {
          with: {
            permission: true,
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
      directPermissions:
        u.usersToPermissions?.map((up) => up.permission.name) || [],
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
        throw new BadRequestException(
          'Ese correo ya está registrado por otro usuario',
        );
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

  // ==========================================
  // 2. ROLES
  // ==========================================

  async createRole(dto: CreateRoleDto) {
    const [role] = await this.db
      .insert(schema.roles)
      .values({
        name: dto.name.toUpperCase().trim(),
        description: dto.description,
        isActive: true,
      })
      .returning();
    return role;
  }

  async findAllRoles() {
    return this.db.query.roles.findMany({
      with: {
        rolesToPermissions: {
          with: {
            permission: true,
          },
        },
      },
    });
  }

  async deactivateRole(id: string) {
    const [role] = await this.db
      .update(schema.roles)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(schema.roles.id, id))
      .returning();

    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    return { message: `Rol ${role.name} deshabilitado exitosamente`, role };
  }

  async activateRole(id: string) {
    const [role] = await this.db
      .update(schema.roles)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(schema.roles.id, id))
      .returning();

    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    return { message: `Rol ${role.name} reactivado exitosamente`, role };
  }

  async assignRoleToUser(userId: string, dto: AssignRoleDto) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const role = await this.db.query.roles.findFirst({
      where: eq(schema.roles.id, dto.roleId),
    });
    if (!role) throw new NotFoundException('Rol no encontrado');

    if (!role.isActive) {
      throw new BadRequestException('No se puede asignar un rol deshabilitado');
    }

    const existing = await this.db.query.usersToRoles.findFirst({
      where: and(
        eq(schema.usersToRoles.userId, userId),
        eq(schema.usersToRoles.roleId, dto.roleId),
      ),
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
      .where(
        and(
          eq(schema.usersToRoles.userId, userId),
          eq(schema.usersToRoles.roleId, roleId),
        ),
      );

    return { message: 'Rol removido del usuario correctamente' };
  }

  // ==========================================
  // 3. PERMISOS
  // ==========================================

  async createPermission(dto: CreatePermissionDto) {
    const code = dto.name.toUpperCase().trim().replace(/\s+/g, '_');
    const existing = await this.db.query.permissions.findFirst({
      where: eq(schema.permissions.name, code),
    });

    if (existing) {
      throw new BadRequestException(`El permiso ${code} ya existe`);
    }

    const [newPerm] = await this.db
      .insert(schema.permissions)
      .values({
        name: code,
        slug: code.toLowerCase().replace(/_/g, ':'),
        description: dto.description,
        isActive: true,
      })
      .returning();

    return newPerm;
  }

  async findAllPermissions() {
    return this.db.query.permissions.findMany({
      orderBy: (p, { asc }) => [asc(p.name)],
    });
  }

  async updatePermission(id: string, dto: UpdatePermissionDto) {
    const updateData: Record<string, any> = { updatedAt: new Date() };

    if (dto.name) {
      const code = dto.name.toUpperCase().trim().replace(/\s+/g, '_');
      updateData.name = code;
      updateData.slug = code.toLowerCase().replace(/_/g, ':');
    }
    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }

    const [updated] = await this.db
      .update(schema.permissions)
      .set(updateData)
      .where(eq(schema.permissions.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException('Permiso no encontrado');
    }

    return updated;
  }

  async deactivatePermission(id: string) {
    const [updated] = await this.db
      .update(schema.permissions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(schema.permissions.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException('Permiso no encontrado');
    }

    return {
      message: `Permiso ${updated.name} deshabilitado exitosamente`,
      permission: updated,
    };
  }

  async activatePermission(id: string) {
    const [updated] = await this.db
      .update(schema.permissions)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(schema.permissions.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException('Permiso no encontrado');
    }

    return {
      message: `Permiso ${updated.name} reactivado exitosamente`,
      permission: updated,
    };
  }

  async assignPermissionToUser(userId: string, dto: AssignPermissionToUserDto) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const perm = await this.db.query.permissions.findFirst({
      where: eq(schema.permissions.id, dto.permissionId),
    });
    if (!perm) throw new NotFoundException('Permiso no encontrado');

    if (!perm.isActive) {
      throw new BadRequestException(
        'No se puede asignar un permiso que está deshabilitado',
      );
    }

    const existing = await this.db.query.usersToPermissions.findFirst({
      where: and(
        eq(schema.usersToPermissions.userId, userId),
        eq(schema.usersToPermissions.permissionId, dto.permissionId),
      ),
    });

    if (existing) {
      throw new BadRequestException(
        'El usuario ya cuenta con este permiso asignado directamente',
      );
    }

    await this.db.insert(schema.usersToPermissions).values({
      userId,
      permissionId: dto.permissionId,
    });

    return {
      message: `Permiso ${perm.name} asignado directamente al usuario ${user.fullName}`,
    };
  }

  async removePermissionFromUser(userId: string, permissionId: string) {
    await this.db
      .delete(schema.usersToPermissions)
      .where(
        and(
          eq(schema.usersToPermissions.userId, userId),
          eq(schema.usersToPermissions.permissionId, permissionId),
        ),
      );

    return { message: 'Permiso removido del usuario correctamente' };
  }

  async assignPermissionToRole(roleId: string, dto: AssignPermissionToRoleDto) {
    const role = await this.db.query.roles.findFirst({
      where: eq(schema.roles.id, roleId),
    });
    if (!role) throw new NotFoundException('Rol no encontrado');

    const perm = await this.db.query.permissions.findFirst({
      where: eq(schema.permissions.id, dto.permissionId),
    });
    if (!perm) throw new NotFoundException('Permiso no encontrado');

    if (!perm.isActive) {
      throw new BadRequestException('No se puede asociar un permiso deshabilitado');
    }

    const existing = await this.db.query.rolesToPermissions.findFirst({
      where: and(
        eq(schema.rolesToPermissions.roleId, roleId),
        eq(schema.rolesToPermissions.permissionId, dto.permissionId),
      ),
    });

    if (existing) {
      throw new BadRequestException('El rol ya tiene asignado este permiso');
    }

    await this.db.insert(schema.rolesToPermissions).values({
      roleId,
      permissionId: dto.permissionId,
    });

    return { message: `Permiso ${perm.name} asociado al rol ${role.name}` };
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    await this.db
      .delete(schema.rolesToPermissions)
      .where(
        and(
          eq(schema.rolesToPermissions.roleId, roleId),
          eq(schema.rolesToPermissions.permissionId, permissionId),
        ),
      );

    return { message: 'Permiso removido del rol correctamente' };
  }

  // 4. Sembrado automático (Seed) del catálogo de los 28 permisos
  async seedSystemPermissions() {
    const defaultPermissions = [
      // Workspace
      { name: 'WORKSPACE_CREATE', description: 'Crear workspace' },
      { name: 'WORKSPACE_INVITE_MEMBERS', description: 'Invitar miembros a workspace' },
      { name: 'WORKSPACE_MANAGE_MEMBERS', description: 'Gestionar miembros de workspace' },
      { name: 'WORKSPACE_LIST', description: 'Listar workspace' },
      { name: 'WORKSPACE_EDIT', description: 'Editar workspace' },
      { name: 'WORKSPACE_DEACTIVATE', description: 'Deshabilitar workspace' },
      { name: 'WORKSPACE_DELETE', description: 'Eliminar workspace' },
      // Miembros y Permisos
      { name: 'MEMBER_PERMISSIONS_EDIT', description: 'Editar permisos de miembros' },
      { name: 'MEMBER_PERMISSIONS_REVOKE', description: 'Revocar permisos de miembros' },
      { name: 'PERMISSIONS_ASSIGN', description: 'Asignar permisos' },
      { name: 'PERMISSIONS_LIST', description: 'Listar permisos' },
      // Roles
      { name: 'ROLES_CREATE', description: 'Crear roles' },
      { name: 'ROLES_EDIT', description: 'Editar roles' },
      { name: 'ROLES_DELETE', description: 'Eliminar roles' },
      { name: 'ROLES_DEACTIVATE', description: 'Deshabilitar roles' },
      { name: 'ROLES_LIST', description: 'Listar roles' },
      // Billing y Planes
      { name: 'PLAN_MANAGE', description: 'Gestionar plan' },
      { name: 'PAYMENT_METHODS_CHANGE', description: 'Cambiar medios de pago' },
      { name: 'BILLING_VIEW', description: 'Ver facturacion' },
      // Automatizaciones
      { name: 'AUTOMATIONS_CREATE', description: 'Crear automatizaciones' },
      { name: 'AUTOMATIONS_DEACTIVATE', description: 'Deshabilitar automatizaciones' },
      { name: 'AUTOMATIONS_DELETE', description: 'Eliminar automatizaciones' },
      { name: 'AUTOMATIONS_EDIT', description: 'Editar automatizaciones' },
      { name: 'AUTOMATIONS_LIST', description: 'Listar automatizaciones' },
      // Plugins
      { name: 'PLUGIN_ADD', description: 'Añadir plugin' },
      { name: 'PLUGIN_EDIT', description: 'Editar plugin' },
      { name: 'PLUGIN_DELETE', description: 'Eliminar plugin' },
      { name: 'PLUGIN_LIST', description: 'Listar plugin' },
    ];

    let count = 0;
    for (const p of defaultPermissions) {
      const exists = await this.db.query.permissions.findFirst({
        where: eq(schema.permissions.name, p.name),
      });

      if (!exists) {
        await this.db.insert(schema.permissions).values({
          name: p.name,
          slug: p.name.toLowerCase().replace(/_/g, ':'),
          description: p.description,
          isActive: true,
        });
        count++;
      }
    }

    return {
      message: `Sembrado finalizado con éxito. Se insertaron ${count} permisos nuevos en la base de datos.`,
    };
  }

  // ==========================================
  // 4. GRUPOS DE TRABAJO (WORKGROUPS)
  // ==========================================

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
              columns: {
                id: true,
                email: true,
                fullName: true,
                isActive: true,
              },
            },
          },
        },
      },
    });
  }

  async addUserToWorkgroup(workgroupId: string, dto: AddUserToWorkgroupDto) {
    const workgroup = await this.db.query.workgroups.findFirst({
      where: eq(schema.workgroups.id, workgroupId),
    });
    if (!workgroup) throw new NotFoundException('Grupo de trabajo no encontrado');

    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, dto.userId),
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const existing = await this.db.query.usersToWorkgroups.findFirst({
      where: and(
        eq(schema.usersToWorkgroups.userId, dto.userId),
        eq(schema.usersToWorkgroups.workgroupId, workgroupId),
      ),
    });

    if (existing) {
      throw new BadRequestException(
        'El usuario ya pertenece a este grupo de trabajo',
      );
    }

    await this.db.insert(schema.usersToWorkgroups).values({
      userId: dto.userId,
      workgroupId,
    });

    return {
      message: `Usuario agregado al grupo "${workgroup.name}" correctamente`,
    };
  }

  async removeUserFromWorkgroup(workgroupId: string, userId: string) {
    await this.db
      .delete(schema.usersToWorkgroups)
      .where(
        and(
          eq(schema.usersToWorkgroups.userId, userId),
          eq(schema.usersToWorkgroups.workgroupId, workgroupId),
        ),
      );

    return { message: 'Usuario removido del grupo de trabajo' };
  }
}
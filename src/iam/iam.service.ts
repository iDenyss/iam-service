// src/iam/iam.service.ts
import { Injectable, Inject, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../database/schema';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
      })
      .returning();

    return {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      createdAt: newUser.createdAt,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, dto.email),
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
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
        updatedAt: schema.users.updatedAt,
      });

    if (!updatedUser) {
      throw new BadRequestException('Usuario no encontrado');
    }

    return updatedUser;
  }

  async deleteUser(id: string) {
    const [deletedUser] = await this.db
      .delete(schema.users)
      .where(eq(schema.users.id, id))
      .returning({ id: schema.users.id });

    if (!deletedUser) {
      throw new BadRequestException('Usuario no encontrado');
    }

    return { message: `Usuario con ID ${id} eliminado correctamente` };
  }

  // Obtener todos los usuarios
  async findAll() {
    return this.db.query.users.findMany({
      columns: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
      },
    });
  }
}
// src/database/schema.ts
import { pgTable, uuid, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Entidad: Users (Auth & Credentials)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Entidad: Roles (ej. ADMIN, OPERATOR, VIEWER)
export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
});

// 3. Entidad: Permissions (ej. automations:run, plugins:upload)
export const permissions = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
});

// 4. Relación Muchos a Muchos: Users <-> Roles
export const usersToRoles = pgTable('users_to_roles', {
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  roleId: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.roleId] }),
}));

// 5. Relación Muchos a Muchos: Roles <-> Permissions
export const rolesToPermissions = pgTable('roles_to_permissions', {
  roleId: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
  permissionId: uuid('permission_id').references(() => permissions.id, { onDelete: 'cascade' }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
}));

// Configuración de relaciones para consultas Drizzle
export const usersRelations = relations(users, ({ many }) => ({
  roles: many(usersToRoles),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(usersToRoles),
  permissions: many(rolesToPermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  roles: many(rolesToPermissions),
}));
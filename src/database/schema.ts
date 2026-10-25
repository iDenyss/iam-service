// src/database/schema.ts
import { pgTable, uuid, text, timestamp, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. USUARIOS
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  isActive: boolean('is_active').default(true).notNull(), // Control de habilitación/deshabilitación
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. ROLES
export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(), // ej: 'ADMIN', 'OPERATOR', 'VIEWER'
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. PERMISOS
export const permissions = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(), // ej: 'WORKSPACE_CREATE', 'PLUGIN_ADD'
  slug: text('slug'), // Compatible con implementaciones previas ej: 'workspace:create'
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(), // Habilitar / Deshabilitar permisos
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. TABLA PIVOTE: USUARIOS A ROLES (N:M)
export const usersToRoles = pgTable('users_to_roles', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.roleId] }),
}));

// 5. TABLA PIVOTE: ROLES A PERMISOS (N:M)
export const rolesToPermissions = pgTable('roles_to_permissions', {
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
}));

// 6. TABLA PIVOTE: USUARIOS A PERMISOS DIRECTOS (N:M)
export const usersToPermissions = pgTable('users_to_permissions', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.permissionId] }),
}));

// 7. GRUPOS DE TRABAJO (WORKGROUPS)
export const workgroups = pgTable('workgroups', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 8. TABLA PIVOTE: USUARIOS A GRUPOS DE TRABAJO (N:M)
export const usersToWorkgroups = pgTable('users_to_workgroups', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  workgroupId: uuid('workgroup_id').notNull().references(() => workgroups.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.workgroupId] }),
}));

// ========================================================
// RELACIONES DRIZZLE (Consultas con 'with')
// ========================================================

export const usersRelations = relations(users, ({ many }) => ({
  usersToRoles: many(usersToRoles),
  usersToPermissions: many(usersToPermissions),
  usersToWorkgroups: many(usersToWorkgroups),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  usersToRoles: many(usersToRoles),
  rolesToPermissions: many(rolesToPermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolesToPermissions: many(rolesToPermissions),
  usersToPermissions: many(usersToPermissions),
}));

export const usersToRolesRelations = relations(usersToRoles, ({ one }) => ({
  user: one(users, { fields: [usersToRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [usersToRoles.roleId], references: [roles.id] }),
}));

export const rolesToPermissionsRelations = relations(rolesToPermissions, ({ one }) => ({
  role: one(roles, { fields: [rolesToPermissions.roleId], references: [roles.id] }),
  permission: one(permissions, { fields: [rolesToPermissions.permissionId], references: [permissions.id] }),
}));

export const usersToPermissionsRelations = relations(usersToPermissions, ({ one }) => ({
  user: one(users, { fields: [usersToPermissions.userId], references: [users.id] }),
  permission: one(permissions, { fields: [usersToPermissions.permissionId], references: [permissions.id] }),
}));

export const workgroupsRelations = relations(workgroups, ({ many }) => ({
  usersToWorkgroups: many(usersToWorkgroups),
}));

export const usersToWorkgroupsRelations = relations(usersToWorkgroups, ({ one }) => ({
  user: one(users, { fields: [usersToWorkgroups.userId], references: [users.id] }),
  workgroup: one(workgroups, { fields: [usersToWorkgroups.workgroupId], references: [workgroups.id] }),
}));
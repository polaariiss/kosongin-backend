import { 
  pgTable, 
  serial, 
  varchar, 
  text, 
  boolean, 
  timestamp, 
  decimal, 
  integer,
  uuid
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==========================================
// 1. TABEL USERS
// ==========================================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  nickName: varchar('user_username', { length: 255 }).notNull().unique(),
  fullName: varchar('fullName', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  
  // Reminder fields
  reminderTime: varchar('reminder_time', { length: 5 }), // Contoh format "HH:mm"
  reminderEnabled: boolean('reminder_enabled').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

// ==========================================
// 2. TABEL CONSUMPTION LOGS
// ==========================================
export const consumptionLogs = pgTable('consumption_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  
  // Nullable Image URL
  imageUrl: text('image_url'), 
  
  amount: decimal('amount', { precision: 10, scale: 2 }), 
  
  consumedAt: timestamp('consumed_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

// ==========================================
// 3. TABEL WISHLIST
// ==========================================
export const wishlists = pgTable('wishlists', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  itemName: text('item_name').notNull(),
  
  targetPrice: decimal('target_price', { precision: 10, scale: 2 }),
  notes: text('notes'),
  
  isFulfilled: boolean('is_fulfilled').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

// ==========================================
// DEFINISI RELASI (Untuk kemudahan Query)
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
  consumptionLogs: many(consumptionLogs),
  wishlists: many(wishlists),
}));

export const consumptionLogsRelations = relations(consumptionLogs, ({ one }) => ({
  user: one(users, {
    fields: [consumptionLogs.userId],
    references: [users.id],
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
}));
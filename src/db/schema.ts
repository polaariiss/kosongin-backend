import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  decimal,
  integer,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export enum EmailType {
  REMINDER = 'reminder',
  IMPULSE_DONE = 'impulse_done',
  RESET = 'reset',
}
export enum EmailStatus {
  DELIVERED = 'delivered',
  FAILED = 'failed',
}
export enum ChallengeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
export enum DaysDurationWait {
  THREE_DAYS = 3,
  SEVEN_DAYS = 7,
  FOURTEEN_DAYS = 14,
  THIRTY_DAYS = 30,
}
export enum consumptionCategory {
  FOOD_BAVERAGE = 'makanan & minuman',
  FASHION = 'fashion',
  ELECTRONIC = 'elektronik',
  SELF_CARE = 'perawatan diri',
  ENTERTAINMENT = 'hiburan',
}
export enum impulseStatus {
  WAITING = 'waiting',
  BOUGHT = 'bought',
  CANCELLED = 'cancelled',
}

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
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ==========================================
// 2. TABEL CONSUMPTION LOGS
// ==========================================
export const consumptionLogs = pgTable('consumption_logs', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  itemName: text('item_name').notNull(),
  itemCategory: varchar('item_category').notNull(), // enum consumptionCategory
  reason: text('reason'),
  imageUrl: text('image_url'),
  amount: decimal('amount', { precision: 10, scale: 2 }),
  notes: text('notes'),
  consumedAt: timestamp('consumed_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ==========================================
// 3. TABEL WISHLIST / IMPULSE SHIELD
// ==========================================
export const wishlists = pgTable('wishlists', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  itemName: text('item_name').notNull(),
  itemCategory: varchar('item_category').notNull(), // enum consumptionCategory - wishlistcategory
  estimatetPrice: decimal('price_estimate', { precision: 10, scale: 2 }),
  isFulfilled: boolean('is_fulfilled').default(false).notNull(),
  whislistStatus: varchar('wishlist_status').default(impulseStatus['WAITING']).notNull(), // enum impulseStatus (as history final status)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ==========================================
// 4. TABEL EMAIL_LOGS
// ==========================================
export const emailLogs = pgTable('email_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  emailType: varchar('email_type', { length: 50 }).notNull(), // Contoh: "reminder", "notification"
  status: varchar('status', { length: 20 }).notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
});

// ==========================================
// 5. TABEL CHALLENGE
// ==========================================
export const challenges = pgTable('challenges', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  fullDescription: text('full_description').notNull(),
  rules: text('rules'),
  howTo: text('how_to'),
  categoryTag: varchar('category_tag', { length: 100 }),
  imageUrl: varchar('image_url', { length: 500 }),
  durationDays: integer('duration_days'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  status: varchar('status', { length: 20 })
    .default(ChallengeStatus.ACTIVE)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ==========================================
// 6. TABEL USER_CHALLENGE
// ==========================================
export const userChallenges = pgTable('user_challenges', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  challengeId: uuid('challenge_id')
    .notNull()
    .references(() => challenges.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  progress: integer('progress').default(0),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ==========================================
// DEFINISI RELASI (Untuk kemudahan Query)
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
  consumptionLogs: many(consumptionLogs),
  wishlists: many(wishlists),
  userChallenges: many(userChallenges),
  emailLogs: many(emailLogs),
}));

export const consumptionLogsRelations = relations(
  consumptionLogs,
  ({ one }) => ({
    user: one(users, {
      fields: [consumptionLogs.userId],
      references: [users.id],
    }),
  }),
);

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
}));

export const challengesRelations = relations(challenges, ({ many }) => ({
  participants: many(userChallenges),
}));

export const userChallengeRelations = relations(userChallenges, ({ one }) => ({
  user: one(users, {
    fields: [userChallenges.userId],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [userChallenges.challengeId],
    references: [challenges.id],
  }),
}));

export const emailLogsRelations = relations(emailLogs, ({ one }) => ({
  user: one(users, {
    fields: [emailLogs.userId],
    references: [users.id],
  }),
}));

import {
  pgTable,
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
export enum ConsumptionCategory {
  FOOD_BAVERAGE = 'makanan & minuman',
  FASHION = 'fashion',
  ELECTRONIC = 'elektronik',
  SELF_CARE = 'perawatan diri',
  ENTERTAINMENT = 'hiburan',
}
export enum ImpulseStatus {
  WAITING = 'waiting',
  BOUGHT = 'bought',
  CANCELLED = 'cancelled',
}
export enum ActivityType {
  LOGIN = 'login',
  REGISTER = 'register',
  ADD_CONSUMPTION = 'add_consumption',
  ADD_WISHLIST = 'add_wishlist',
  CANCEL_WISHLIST = 'cancel_wishlist',
  JOIN_CHALLENGE = 'join_challenge',
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isActive: boolean('status').default(true),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),

  // Reminder fields
  reminderTime: varchar('reminder_time', { length: 5 }), // Contoh format "HH:mm"
  reminderEnabled: boolean('reminder_enabled').default(false).notNull(),
});

// ==========================================
// 2. TABEL CONSUMPTION LOGS
// ==========================================
export const consumptionLogs = pgTable('consumption_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
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
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  itemName: text('item_name').notNull(),
  itemCategory: varchar('item_category').notNull(), // enum consumptionCategory
  estimatetPrice: decimal('price_estimate', { precision: 10, scale: 2 }),
  isFulfilled: boolean('is_fulfilled').default(false).notNull(),
  whislistStatus: varchar('wishlist_status')
    .default(ImpulseStatus['WAITING'])
    .notNull(), // enum impulseStatus (as history final status)
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
  imageUrl: text('image_url'),
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
// 7. TABEL ADMIN
// ==========================================
export const admin = pgTable('admin', {
  id: uuid('id').primaryKey().defaultRandom(),
  nickName: varchar('user_username', { length: 255 }).notNull().unique(),
  fullName: varchar('fullName', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ==========================================
// 8. TABEL USER_ACTIVITY_LOGS
// ==========================================
export const userActivityLogs = pgTable('user_activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  activityType: varchar('acctivity_type', { length: 50 }).notNull(), // enum ActivityType
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// DEFINISI RELASI (Untuk kemudahan Query)
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
  consumptionLogs: many(consumptionLogs),
  wishlists: many(wishlists),
  userChallenges: many(userChallenges),
  emailLogs: many(emailLogs),
  activityLogs: many(userActivityLogs),
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

export const userActivityRelations = relations(userActivityLogs, ({ one }) => ({
  user: one(users, {
    fields: [userActivityLogs.userId],
    references: [users.id],
  }),
}));

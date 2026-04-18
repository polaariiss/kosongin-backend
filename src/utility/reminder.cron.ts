import cron from 'node-cron';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, gte, lte } from 'drizzle-orm';
import { users, emailLogs, wishlists, ImpulseStatus } from '../db/schema';
import { sendReminderEmail, sendResetPasswordEmail, sendImpulseDoneEmail } from './mail.service';
import { EmailType, EmailStatus } from '../db/schema';

const db = drizzle(process.env.DATABASE_URL!);

export const startImpulseCron = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('🕒 Running Impulse Shield Cron Job...');
    const pendingWishlists = await db
      .select({
        wishlist: wishlists,
        user: users,
      })
      .from(wishlists)
      .innerJoin(users, eq(wishlists.userId, users.id))
      .where(
        and(
          eq(wishlists.notificationSent, false),
          eq(wishlists.whislistStatus, ImpulseStatus.WAITING),
        ),
      );

    const now = new Date();
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (const { wishlist, user } of pendingWishlists) {
      const createdAt = new Date(wishlist.createdAt);
      const createdDate = new Date(
        createdAt.getFullYear(),
        createdAt.getMonth(),
        createdAt.getDate(),
      );

      const diffTime = nowDate.getTime() - createdDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= wishlist.waitingDays) {
        try {
          await sendImpulseDoneEmail(user.email, user.fullName, wishlist.itemName);

          await db
            .update(wishlists)
            .set({ notificationSent: true })
            .where(eq(wishlists.id, wishlist.id));

          await db.insert(emailLogs).values({
            userId: user.id,
            emailType: EmailType.IMPULSE_DONE,
            status: EmailStatus.DELIVERED,
          });
          
          console.log(`✅ Sent impulse notification for item: ${wishlist.itemName} to ${user.email}`);
        } catch (error) {
          console.error(`❌ Failed to send impulse notification for item: ${wishlist.itemName}`, error);
          await db.insert(emailLogs).values({
            userId: user.id,
            emailType: EmailType.IMPULSE_DONE,
            status: EmailStatus.FAILED,
          });
        }
      }
    }
  });
};

export const startReminderCron = () => {
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const usersToRemind = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.reminderEnabled, true),
          eq(users.reminderTime, currentTime),
        ),
      );
    for (const user of usersToRemind) {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));
      const [alreadySent] = await db
        .select()
        .from(emailLogs)
        .where(
          and(
            eq(emailLogs.userId, user.id),
            eq(emailLogs.emailType, EmailType.REMINDER),
            gte(emailLogs.sentAt, startOfDay),
            lte(emailLogs.sentAt, endOfDay),
          ),
        );
      if (alreadySent) continue;
      try {
        await sendReminderEmail(user.email, user.fullName);

        await db.insert(emailLogs).values({
          userId: user.id,
          emailType: EmailType.REMINDER,
          status: EmailStatus.DELIVERED,
        });
      } catch (error) {
        await db.insert(emailLogs).values({
            userId: user.id,
            emailType: EmailType.REMINDER,
            status: EmailStatus.FAILED
        })
      }
    }
  });
};

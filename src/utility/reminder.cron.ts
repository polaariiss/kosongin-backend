import cron from 'node-cron';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, gte, lte } from 'drizzle-orm';
import { users, emailLogs } from '../db/schema';
import { sendReminderEmail, sendResetPasswordEmail } from './mail.service';
import { EmailType, EmailStatus } from '../db/schema';

const db = drizzle(process.env.DATABASE_URL!);

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

import { db } from '../config/db.js';
import {
  admin,
  users,
  challenges,
  consumptionLogs,
  wishlists,
  ConsumptionCategory,
  ChallengeStatus,
  ImpulseStatus,
} from './schema.js';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function seed() {
  console.log('🌱 Memulai proses seeding data...');

  // 1. SEED ADMIN
  const existingAdmins = await db.select().from(admin).limit(1);
  if (existingAdmins.length === 0) {
    const hashedAdminPassword = await bcrypt.hash('Admin123!', 10);
    await db.insert(admin).values({
      email: 'admin@kosongin.com',
      nickName: 'superadmin',
      fullName: 'Super Admin Kosongin',
      password: hashedAdminPassword,
    });
    console.log('✅ Seed Admin berhasil');
  }

  // 2. SEED USERS
  const existingUsers = await db.select().from(users).limit(1);
  let userId: string;
  if (existingUsers.length === 0) {
    const hashedUserPassword = await bcrypt.hash('User123!', 10);
    const [newUser] = await db
      .insert(users)
      .values({
        email: 'user@example.com',
        nickName: 'user_tester',
        fullName: 'User Tester Kosongin',
        password: hashedUserPassword,
        reminderEnabled: true,
        reminderTime: '20:00',
      })
      .returning({ id: users.id });

    if (!newUser) {
      throw new Error('Failed to create seed user');
    }
    userId = newUser.id;
    console.log('Seed User berhasil');
  } else {
    const firstUser = existingUsers[0];
    if (!firstUser) {
      throw new Error('User list is empty despite length check');
    }
    userId = firstUser.id;
  }

  // 3. SEED CHALLENGES
  const existingChallenges = await db.select().from(challenges).limit(1);
  if (existingChallenges.length === 0) {
    await db.insert(challenges).values([
      {
        title: '30 Hari Tanpa Jajan Boba',
        description: 'Tantangan untuk mengurangi konsumsi minuman manis selama sebulan.',
        fullDescription: 'Dalam tantangan ini, kamu diajak untuk tidak membeli minuman boba atau kopi kekinian selama 30 hari penuh. Selain lebih sehat, kamu juga bisa menghemat uang jajan!',
        rules: '1. Tidak membeli minuman manis kemasan. 2. Catat setiap kali merasa tergoda tapi berhasil menahan diri.',
        howTo: 'Cukup klik gabung dan mulai catat progres harianmu.',
        categoryTag: 'Kesehatan',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1631234567/boba_challenge.jpg',
        durationDays: 30,
        status: ChallengeStatus.ACTIVE,
      },
      {
        title: 'Fashion Fasting',
        description: 'Berhenti membeli baju baru selama 3 bulan.',
        fullDescription: 'Mari dukung sustainable fashion dengan tidak membeli pakaian baru (fast fashion) selama 3 bulan ke depan. Gunakan kembali koleksi lama di lemarimu!',
        rules: 'Dilarang membeli baju, celana, atau aksesoris fashion baru kecuali sangat mendesak (misal: seragam kerja).',
        howTo: 'Gabung dan bagikan OOTD dari baju lama kamu di komunitas.',
        categoryTag: 'Lingkungan',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1631234568/fashion_challenge.jpg',
        durationDays: 90,
        status: ChallengeStatus.ACTIVE,
      },
    ]);
    console.log('✅ Seed Challenges berhasil');
  }

  // 4. SEED CONSUMPTION LOGS
  const existingLogs = await db.select().from(consumptionLogs).limit(1);
  if (existingLogs.length === 0) {
    await db.insert(consumptionLogs).values([
      {
        userId: userId,
        itemName: 'Kopi Kenangan',
        itemCategory: ConsumptionCategory.FOOD_BAVERAGE,
        amount: '25000',
        notes: 'Beli sore-sore karena ngantuk.',
      },
      {
        userId: userId,
        itemName: 'Kaos Uniqlo',
        itemCategory: ConsumptionCategory.FASHION,
        amount: '150000',
        notes: 'Lagi diskon jadi khilaf.',
      },
      {
        userId: userId,
        itemName: 'Mouse Logitech',
        itemCategory: ConsumptionCategory.ELECTRONIC,
        amount: '300000',
        notes: 'Kebutuhan kerja, mouse lama rusak.',
      },
    ]);
    console.log('✅ Seed Consumption Logs berhasil');
  }

  // 5. SEED WISHLISTS (Impulse Shield)
  const existingWishlists = await db.select().from(wishlists).limit(1);
  if (existingWishlists.length === 0) {
    await db.insert(wishlists).values([
      {
        userId: userId,
        itemName: 'PlayStation 5',
        itemCategory: ConsumptionCategory.ELECTRONIC,
        estimatePrice: '8500000',
        reason: 'Pengen main game eksklusif Sony.',
        waitingDays: 30,
        whislistStatus: ImpulseStatus.WAITING,
      },
      {
        userId: userId,
        itemName: 'Sepatu lari Nike',
        itemCategory: ConsumptionCategory.FASHION,
        estimatePrice: '1200000',
        reason: 'Sepatu lama sudah mulai tipis solnya.',
        waitingDays: 14,
        whislistStatus: ImpulseStatus.WAITING,
      },
    ]);
    console.log('Seed Wishlists berhasil');
  }

  console.log('Seeding selesai dengan sukses!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding gagal:', err);
  process.exit(1);
});

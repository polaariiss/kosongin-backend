import type { Request, Response } from 'express';
import { db } from '../config/db'; // Sesuaikan lokasi koneksi DB kamu
import { consumptionLogs } from '../db/schema';

export const createConsumptionLog = async (req: Request, res: Response) => {
  try {
    // 1. Ambil data teks (Sudah bersih karena melewati Zod)
    const { userId, title, description, amount, imageUrl } = req.body;

    // 3. Simpan ke database Drizzle
    const newLog = await db.insert(consumptionLogs).values({
      userId,
      itemName: title,
      itemCategory: description,
      amount,
      imageUrl,
    }).returning();

    res.status(201).json({
      message: 'Log konsumsi berhasil dicatat',
      data: newLog[0]
    });
  } catch (error) {
    console.error("Error create log:", error);
    res.status(500).json({ error: 'Gagal membuat log konsumsi' });
  }
};
import type { Request, Response } from 'express';
import { 
  insertLog, 
  findLogs, 
  findLogById, 
  updateLogById, 
  deleteLogById 
} from '../query/consumptions.query';

export const createConsumptionLog = async (req: Request, res: Response) => {
  try {
    const newLog = await insertLog(req.body);
    res.status(201).json({
      message: 'Log konsumsi berhasil dicatat',
      data: newLog[0]
    });
  } catch (error) {
    console.error("Error create log:", error);
    res.status(500).json({ error: 'Gagal membuat log konsumsi' });
  }
};

export const getConsumptionLogs = async (req: Request, res: Response) => {
  try {
    const { userId, category, sortBy, order } = req.query as any;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID wajib disertakan dalam query' });
    }

    const logs = await findLogs({ userId, category, sortBy, order });
    res.json(logs);
  } catch (error) {
    console.error("Error fetch logs:", error);
    res.status(500).json({ error: 'Gagal mengambil log konsumsi' });
  }
};

export const updateConsumptionLog = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const log = await findLogById(id);
    
    if (!log) {
      return res.status(404).json({ error: 'Log tidak ditemukan' });
    }

    const updatedLog = await updateLogById(id, req.body);
    res.json({
      message: 'Log konsumsi berhasil diperbarui',
      data: updatedLog[0]
    });
  } catch (error) {
    console.error("Error update log:", error);
    res.status(500).json({ error: 'Gagal memperbarui log konsumsi' });
  }
};

export const deleteConsumptionLog = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deletedLog = await deleteLogById(id);
    
    if (deletedLog.length === 0) {
      return res.status(404).json({ error: 'Log tidak ditemukan' });
    }

    res.json({ message: 'Log konsumsi berhasil dihapus' });
  } catch (error) {
    console.error("Error delete log:", error);
    res.status(500).json({ error: 'Gagal menghapus log konsumsi' });
  }
};

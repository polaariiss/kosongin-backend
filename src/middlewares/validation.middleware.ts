import type { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

/**
 * Middleware untuk memvalidasi Request Body (req.body)
 * Digunakan pada method POST, PUT, atau PATCH
 */
export const validateBody = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // parseAsync akan mengecek dan membersihkan data sesuai skema Zod
      req.body = await schema.parseAsync(req.body);
      next(); // Lanjut ke controller jika sukses
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validasi data (body) gagal',
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error); // Lempar error lain ke global error handler
    }
  };
};

/**
 * Middleware untuk memvalidasi Request Params (req.params)
 * Digunakan untuk mengecek variabel di URL (contoh: /users/:id)
 */
export const validateParams = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // parseAsync mengecek parameter URL
      req.params = await schema.parseAsync(req.params) as any;
      next(); // Lanjut ke controller jika sukses
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validasi parameter URL gagal',
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

/**
 * (Bonus) Middleware untuk memvalidasi Request Query (req.query)
 * Berguna jika nanti kamu punya endpoint seperti /users?search=john&limit=10
 */
export const validateQuery = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validasi query parameter gagal',
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};
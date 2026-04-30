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
      const validatedBody = await schema.parseAsync(req.body);
      Object.assign(req.body, validatedBody);
      next(); // Lanjut ke controller jika sukses
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validasi data (body) gagal',
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
 * Middleware untuk memvalidasi Request Params (req.params)
 * Digunakan untuk mengecek variabel di URL (contoh: /users/:id)
 */
export const validateParams = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // parseAsync mengecek parameter URL
      const validatedParams = await schema.parseAsync(req.params);
      Object.assign(req.params, validatedParams);
      next(); // Lanjut ke controller jika sukses
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
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
      const validatedQuery = await schema.parseAsync(req.query);
      Object.assign(req.query, validatedQuery);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
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

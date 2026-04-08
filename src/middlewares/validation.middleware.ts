import type { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Middleware untuk validasi request body
export const validateBody = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse & validate body
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format error messages
        const errorMessages = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          error: 'Validation failed',
          details: errorMessages,
        });
      }
      next(error);
    }
  };
};

// Middleware untuk validasi request params
export const validateParams = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = (await schema.parseAsync(req.params)) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          error: 'Invalid parameters',
          details: errorMessages,
        });
      }
      next(error);
    }
  };
};
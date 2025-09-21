import { z } from 'zod';

export const AppointmentTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  duration: z.number().int().positive('Duration must be a positive number'),
  location: z.string().optional(),
  notes: z.string().optional(),
});

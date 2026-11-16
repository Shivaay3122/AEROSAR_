import { z } from 'zod';
import type { MissionInputs } from '@/types';

export const speedUnitSchema = z.enum(['knots', 'kmh', 'mph']);

export const missionInputsSchema = z.object({
  lat: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  lon: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  timestamp: z.string().refine(
    (val) => {
      const d = new Date(val);
      return !isNaN(d.getTime());
    },
    { message: 'Enter a valid date and time' }
  ),
  heading: z
    .number()
    .min(0, 'Heading must be 0–359')
    .max(359, 'Heading must be 0–359'),
  speed: z.number().min(0, 'Speed must be positive').max(3000, 'Speed exceeds maximum'),
  speedUnit: speedUnitSchema,
  endurance: z.number().min(0, 'Endurance must be positive').max(72, 'Endurance exceeds maximum'),
  windDirection: z
    .number()
    .min(0, 'Wind direction must be 0–359')
    .max(359, 'Wind direction must be 0–359'),
  windSpeed: z.number().min(0, 'Wind speed must be positive').max(300, 'Wind speed exceeds maximum'),
  windSpeedUnit: speedUnitSchema,
  positionUncertaintyKm: z
    .number()
    .min(0, 'Uncertainty must be positive')
    .max(500, 'Uncertainty exceeds maximum'),
});

export type ValidationError = { field: string; message: string };

export function validateInputs(inputs: MissionInputs): ValidationError[] {
  const result = missionInputsSchema.safeParse(inputs);
  if (result.success) return [];
  return result.error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

export function isComplete(inputs: Record<string, unknown>): boolean {
  const required = ['lat', 'lon', 'timestamp', 'heading', 'speed', 'speedUnit', 'endurance', 'windDirection', 'windSpeed', 'windSpeedUnit', 'positionUncertaintyKm'];
  return required.every((k) => inputs[k] !== undefined && inputs[k] !== null && inputs[k] !== '');
}

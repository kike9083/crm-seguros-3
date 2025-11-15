import { LeadStatus, TaskStatus, ProductCategory } from './types';

export const LEAD_STATUSES: LeadStatus[] = ['NUEVO', 'CONTACTADO', 'CALIFICADO', 'PERDIDO', 'GANADO'];
export const TASK_STATUSES: TaskStatus[] = ['PENDIENTE', 'EN PROGRESO', 'COMPLETADA'];
export const PRODUCT_CATEGORIES: ProductCategory[] = ['autos', 'salud', 'vida', 'daños', 'inversion'];

export const STATUS_COLORS: Record<LeadStatus | TaskStatus, string> = {
    'NUEVO': 'bg-blue-600',
    'CONTACTADO': 'bg-yellow-500',
    'CALIFICADO': 'bg-purple-600',
    'PERDIDO': 'bg-red-600',
    'GANADO': 'bg-green-600',
    'PENDIENTE': 'bg-gray-500',
    'EN PROGRESO': 'bg-indigo-500',
    'COMPLETADA': 'bg-teal-600',
};
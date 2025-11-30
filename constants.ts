import { LeadStatus, TaskStatus } from './types';

export const LEAD_STATUSES: LeadStatus[] = ['PROSPECTO', 'V1', 'V2', 'V3', 'NO INTERESADO', 'GANADO'];
export const TASK_STATUSES: TaskStatus[] = ['PENDIENTE', 'EN PROGRESO', 'COMPLETADA'];

export const STATUS_COLORS: Record<LeadStatus | TaskStatus | string, string> = {
    'PROSPECTO': 'bg-gray-500',
    'V1': 'bg-blue-500',
    'V2': 'bg-indigo-500',
    'V3': 'bg-purple-500',
    'NO INTERESADO': 'bg-red-500',
    'GANADO': 'bg-green-600',
    
    // Legacy support
    'NUEVO': 'bg-gray-500',
    'CONTACTADO': 'bg-blue-500',
    'CALIFICADO': 'bg-purple-500',
    'PERDIDO': 'bg-red-600',

    'PENDIENTE': 'bg-gray-500',
    'EN PROGRESO': 'bg-indigo-500',
    'COMPLETADA': 'bg-teal-600',
};

export type LeadStatus = 'NUEVO' | 'CONTACTADO' | 'CALIFICADO' | 'PERDIDO' | 'GANADO';
export type TaskStatus = 'PENDIENTE' | 'EN PROGRESO' | 'COMPLETADA';
export type PolicyStatus = 'ACTIVA' | 'PENDIENTE PAGO' | 'CANCELADA' | 'VENCIDA';

export interface Lead {
    id: number;
    created_at: string;
    nombre: string;
    email: string;
    telefono: string;
    fuente: string;
    estatus_lead: LeadStatus;
    user_asignado_id?: string; // Assuming UUID from Supabase auth
    notas?: string;
}

export interface Client {
    id: number;
    created_at: string;
    nombre: string;
    email: string;
    telefono: string;
    fecha_nacimiento?: string;
    lead_origen_id?: number;
}

export interface Policy {
    id: number;
    created_at: string;
    client_id: number;
    product_id: number;
    prima_total: number;
    fecha_emision: string;
    fecha_vencimiento: string;
    estatus_poliza: PolicyStatus;
    comision_agente: number;
    clients: { nombre: string } | { nombre: string }[] | null; // For joins
    products: { nombre: string } | { nombre: string }[] | null; // For joins
}

export interface Product {
    id: number;
    created_at: string;
    nombre: string;
    aseguradora: string;
    comision_porcentaje: number;
    precio_base: number;
    activo: boolean;
    categoria?: string;
    descripcion?: string;
}

export interface Task {
    id: number;
    created_at: string;
    lead_id?: number;
    client_id?: number;
    tipo: 'LLAMADA' | 'EMAIL' | 'CITA' | 'WHATSAPP';
    fecha_vencimiento: string;
    prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
    descripcion: string;
    estatus: TaskStatus;
    leads?: { nombre: string } | { nombre: string }[] | null;
    clients?: { nombre: string } | { nombre: string }[] | null;
}
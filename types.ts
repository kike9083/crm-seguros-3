export type LeadStatus = 'NUEVO' | 'CONTACTADO' | 'CALIFICADO' | 'PERDIDO' | 'GANADO';
export type TaskStatus = 'PENDIENTE' | 'EN PROGRESO' | 'COMPLETADA';
export type PolicyStatus = 'ACTIVA' | 'PENDIENTE PAGO' | 'CANCELADA' | 'VENCIDA';
export type UserRole = 'ADMIN' | 'AGENTE';
export type ProductCategory = 'autos' | 'salud' | 'vida' | 'daños' | 'inversion';

export interface Team {
    id: string; // uuid
    name: string;
    created_at: string;
}

export interface Profile {
    id: string; // uuid
    nombre: string;
    rol: UserRole;
    team_id?: string; // uuid
}

export interface Lead {
    id: number;
    created_at: string;
    nombre: string;
    email: string;
    telefono: string;
    fuente: string;
    estatus_lead: LeadStatus;
    agent_id?: string;
    notas?: string;
    team_id?: string;
}

export interface Client {
    id: number;
    created_at: string;
    nombre: string;
    email: string;
    telefono: string;
    fecha_nacimiento?: string;
    lead_origen_id?: number;
    agent_id?: string;
    team_id?: string;
    profiles?: { nombre: string } | null;
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
    agent_id?: string;
    team_id?: string;
    clients: { nombre: string } | { nombre: string }[] | null; 
    products: { nombre: string } | { nombre: string }[] | null;
}

export interface Product {
    id: number;
    created_at: string;
    nombre: string;
    aseguradora: string;
    comision_porcentaje: number;
    precio_base: number;
    activo: boolean;
    categoria?: ProductCategory;
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
    agent_id?: string;
    team_id?: string;
    leads?: { nombre: string } | { nombre: string }[] | null;
    clients?: { nombre: string } | { nombre: string }[] | null;
}

export interface FileObject {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
}
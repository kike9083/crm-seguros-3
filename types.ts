export type LeadStatus = 'NUEVO' | 'CONTACTADO' | 'CALIFICADO' | 'PERDIDO' | 'GANADO';
export type TaskStatus = 'PENDIENTE' | 'EN PROGRESO' | 'COMPLETADA';
export type PolicyStatus = 'ACTIVA' | 'PENDIENTE PAGO' | 'CANCELADA' | 'VENCIDA';
export type UserRole = 'ADMIN' | 'AGENTE';

export interface Profile {
    id: string; // uuid
    nombre: string;
    rol: UserRole;
}

export interface Lead {
    id: number;
    created_at: string;
    updated_at?: string;
    nombre: string;
    email: string;
    telefono: string;
    fuente: string;
    estatus_lead: LeadStatus;
    agent_id?: string;
    user_id?: string; // Nuevo campo añadido en DB
    notas?: string;
    // Nuevos campos homologados con Client
    fecha_nacimiento?: string;
    ocupacion?: string;
    ingresos_mensuales?: number;
    polizas_externas?: string;
}

export interface Client {
    id: number;
    created_at: string;
    updated_at?: string;
    nombre: string;
    email: string;
    telefono: string;
    fecha_nacimiento?: string;
    lead_origen_id?: number;
    agent_id?: string;
    user_id?: string; // Nuevo campo añadido en DB
    // Nuevos campos solicitados
    ocupacion?: string;
    ingresos_mensuales?: number;
    polizas_externas?: string; // Descripción de pólizas con otras aseguradoras
}

export interface Policy {
    id: number;
    created_at: string;
    updated_at?: string;
    client_id: number;
    product_id: number;
    prima_total: number;
    fecha_emision: string;
    fecha_vencimiento: string;
    estatus_poliza: PolicyStatus;
    comision_agente: number;
    agent_id?: string;
    user_id?: string;
    clients: { nombre: string; agent_id?: string } | { nombre: string; agent_id?: string }[] | null; 
    products: { nombre: string; categoria?: string } | { nombre: string; categoria?: string }[] | null;
}

export interface Product {
    id: number;
    created_at: string;
    updated_at?: string;
    nombre: string;
    aseguradora: string;
    comision_porcentaje: number;
    precio_base: number;
    activo: boolean;
    categoria?: string; // 'Vida', 'Salud', 'AP', etc.
    descripcion?: string;
}

export interface Task {
    id: number;
    created_at: string;
    updated_at?: string;
    lead_id?: number;
    client_id?: number;
    tipo: 'LLAMADA' | 'EMAIL' | 'CITA' | 'WHATSAPP';
    fecha_vencimiento: string;
    prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
    descripcion: string;
    estatus: TaskStatus;
    agent_id?: string;
    user_id?: string;
    leads?: { nombre: string; agent_id?: string } | { nombre: string; agent_id?: string }[] | null;
    clients?: { nombre: string; agent_id?: string } | { nombre: string; agent_id?: string }[] | null;
}

export interface FileObject {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
}

export interface MonthlyGoal {
    month: number; // 0-11
    year: number;
    vida: number;
    ap: number; // Accidentes Personales
    salud: number;
}
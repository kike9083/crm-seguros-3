export type LeadStatus = 'PROSPECTO' | 'V1' | 'V2' | 'V3' | 'NO INTERESADO' | 'GANADO' | 'NUEVO' | 'CONTACTADO' | 'CALIFICADO' | 'PERDIDO'; 
export type TaskStatus = 'PENDIENTE' | 'EN PROGRESO' | 'COMPLETADA';
export type PolicyStatus = 'ACTIVA' | 'PENDIENTE PAGO' | 'CANCELADA' | 'VENCIDA';
export type UserRole = 'ADMIN' | 'AGENTE';

export interface Profile {
    id: string; 
    nombre: string;
    rol: UserRole;
}

export interface Lead {
    id: number;
    created_at: string;
    updated_at?: string;
    nombre: string;
    email: string;
    telefono1: string;
    telefono2?: string;
    fuente: string;
    estatus_lead: LeadStatus;
    agent_id?: string;
    user_id?: string;
    notas?: string;
    fecha_nacimiento?: string;
    ocupacion?: string;
    ingresos_mensuales?: number;
    polizas_externas?: string;
    // Nuevos campos
    cedula?: string;
    empresa?: string;
}

export interface Client {
    id: number;
    created_at: string;
    updated_at?: string;
    nombre: string;
    email: string;
    telefono1: string;
    telefono2?: string;
    fecha_nacimiento?: string;
    lead_origen_id?: number;
    agent_id?: string;
    user_id?: string;
    ocupacion?: string;
    ingresos_mensuales?: number;
    polizas_externas?: string;
    // Nuevos campos
    cedula?: string;
    empresa?: string;
}

export interface ProductDetail {
    id: number;
    nombre: string;
    categoria: string;
    aseguradora: string;
    prima_mensual: number;
    suma_asegurada: number;
    comision_porcentaje: number;
    comision_generada: number;
}

export interface Policy {
    id: number;
    created_at: string;
    updated_at?: string;
    client_id: number;
    product_id: number; 
    
    prima_total: number; 
    suma_asegurada_total: number;
    
    fecha_emision: string;
    fecha_vencimiento: string;
    estatus_poliza: PolicyStatus;
    comision_agente: number;
    agent_id?: string;
    user_id?: string;
    
    productos_detalle?: ProductDetail[]; 

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
    prima_mensual: number; 
    suma_asegurada: number; 
    activo: boolean;
    categoria?: string; 
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
    month: number; 
    year: number;
    vida: number;
    ap: number; 
    salud: number;
}

export interface AuditLog {
    id: number;
    user_id: string;
    action: string;
    entity: string;
    entity_id?: string;
    details?: any;
    created_at: string;
    profiles?: { nombre: string; rol: string } | null; 
}
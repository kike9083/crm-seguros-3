import { supabase } from './supabaseClient';
import { Lead, Client, Policy, Task, Product, Profile, UserRole, FileObject, LeadStatus, MonthlyGoal, AuditLog } from '../types';
import { AuthError, Session, User } from '@supabase/supabase-js';

export { supabase };

export const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'Ocurrió un error inesperado.';
};

export const sanitizeFileName = (name: string): string => {
    return name
        .normalize("NFD") 
        .replace(/[\u0300-\u036f]/g, "") 
        .replace(/\s+/g, '_') 
        .replace(/[^a-zA-Z0-9.\-_]/g, ''); 
};

const logActivity = async (action: string, entity: string, entityId?: string, details?: object) => {
    try {
        await supabase.rpc('log_activity', {
            p_action: action,
            p_entity: entity,
            p_entity_id: entityId,
            p_details: details
        });
    } catch (e) {
        console.error("Failed to log activity:", e);
    }
};

export const getAuditLogs = async () => {
    const { data, error } = await supabase
        .from('audit_logs')
        .select('*') 
        .order('created_at', { ascending: false })
        .limit(200);
    if (error) throw error;
    return data as unknown as AuditLog[];
};

// Auth (unchanged)
export const signInWithPassword = async (email: string, password: string): Promise<{ session: Session | null; error: AuthError | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { session: data?.session ?? null, error };
};

export const signUp = async (email: string, password: string, nombre: string): Promise<{ user: User | null; error: AuthError | null }> => {
    const { data, error } = await supabase.auth.signUp({ 
        email, 
        password, 
        options: {
            data: {
                nombre: nombre,
                rol: 'AGENTE' 
            }
        }
    });
    return { user: data?.user ?? null, error };
};

export const signOut = async () => {
    await supabase.auth.signOut();
};

export const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
};

export const onAuthStateChange = (callback: (session: Session | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session);
    });
    return subscription;
};

export const updateUserMetadata = async (metadata: object) => {
    const { data, error } = await supabase.auth.updateUser({ data: metadata });
    if (error) throw error;
    return data.user;
};

export const updateUserPassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({ password: password });
    if (error) throw error;
    return data;
};

// Profiles (unchanged)
export const getProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error && error.code !== 'PGRST116') { 
        console.error("Error fetching profile:", error);
        throw error;
    }
    return data as Profile | null;
};

export const getAllProfiles = async (): Promise<Profile[]> => {
    const { data, error } = await supabase.rpc('get_all_profiles_for_admin');
    if (error) throw error;
    return data as Profile[];
}

export const createProfile = async (profile: { id: string, nombre: string, rol: UserRole }): Promise<Profile> => {
    const { data, error } = await supabase
        .from('profiles')
        .upsert(profile)
        .select()
        .single();
    if (error) {
        console.error("Error creating profile:", error);
        throw error;
    }
    return data;
};

export const updateProfileData = async (id: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    if (updates.nombre) {
        await updateUserMetadata({ nombre: updates.nombre });
    }
    return data as Profile;
};

export const createNewUser = async (email: string, password: string, nombre: string, rol: UserRole) => {
    const { data, error } = await supabase.rpc('create_new_user', {
        email, password, nombre, rol
    });
    if(error) throw error;
    return data;
}

// Leads (Updated for cedula, empresa)
export const getLeads = async () => {
    const { data, error } = await supabase.rpc('get_leads_for_user');
    if (error) throw error;
    return data as Lead[];
};

export const createLead = async (leadData: Omit<Lead, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.rpc('create_lead_secure', {
        p_nombre: leadData.nombre,
        p_email: leadData.email,
        p_telefono1: leadData.telefono1,
        p_telefono2: leadData.telefono2 || null,
        p_fuente: leadData.fuente,
        p_estatus_lead: leadData.estatus_lead,
        p_notas: leadData.notas,
        p_agent_id: leadData.agent_id || null,
        p_fecha_nacimiento: leadData.fecha_nacimiento || null,
        p_ocupacion: leadData.ocupacion || null,
        p_ingresos_mensuales: leadData.ingresos_mensuales || null,
        p_polizas_externas: leadData.polizas_externas || null,
        p_cedula: leadData.cedula || null, // New
        p_empresa: leadData.empresa || null // New
    }).single();
    if (error) throw error;
    return data as Lead;
};

export const bulkCreateLeads = async (leadsData: any[]) => {
    const { data, error } = await supabase
        .from('leads')
        .insert(leadsData)
        .select();
    if (error) throw error;
    await logActivity('IMPORT', 'LEAD', undefined, { count: leadsData.length });
    return data;
};

export const updateLead = async (id: number, updates: Omit<Lead, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.rpc('update_lead_secure', {
        p_id: id,
        p_nombre: updates.nombre,
        p_email: updates.email,
        p_telefono1: updates.telefono1,
        p_telefono2: updates.telefono2 || null,
        p_fuente: updates.fuente,
        p_estatus_lead: updates.estatus_lead,
        p_notas: updates.notas || '',
        p_agent_id: updates.agent_id || null,
        p_fecha_nacimiento: updates.fecha_nacimiento || null,
        p_ocupacion: updates.ocupacion || null,
        p_ingresos_mensuales: updates.ingresos_mensuales || null,
        p_polizas_externas: updates.polizas_externas || null,
        p_cedula: updates.cedula || null, // New
        p_empresa: updates.empresa || null // New
    }).single();
    if (error) throw error;
    return data as Lead;
};

export const deleteLead = async (id: number) => {
    const { error } = await supabase.rpc('delete_lead_secure', { p_id: id });
    if (error) throw error;
    await logActivity('DELETE', 'LEAD', String(id));
};

export const promoteLeadToClient = async (leadId: number) => {
    const { data, error } = await supabase.rpc('promote_lead_to_client', { p_lead_id: leadId });
    if (error) throw error;
    return data;
};

// Clients (Updated for cedula, empresa)
export const getClients = async () => {
    const { data, error } = await supabase.rpc('get_clients_for_user');
    if (error) throw error;
    return data as Client[];
};

export const updateClient = async (id: number, updates: Omit<Client, 'id' | 'created_at' | 'lead_origen_id'>) => {
    const { data, error } = await supabase.rpc('update_client_secure', {
        p_id: id,
        p_nombre: updates.nombre,
        p_email: updates.email,
        p_telefono1: updates.telefono1,
        p_telefono2: updates.telefono2 || null,
        p_fecha_nacimiento: updates.fecha_nacimiento || null,
        p_agent_id: updates.agent_id || null,
        p_ocupacion: updates.ocupacion || null,
        p_ingresos_mensuales: updates.ingresos_mensuales || null,
        p_polizas_externas: updates.polizas_externas || null,
        p_cedula: updates.cedula || null, // New
        p_empresa: updates.empresa || null // New
    }).single();
    if (error) throw error;
    return data as Client;
};

export const deleteClient = async (id: number) => {
    const { error } = await supabase.rpc('delete_client_secure', { p_id: id });
    if (error) throw error;
    await logActivity('DELETE', 'CLIENT', String(id));
};

// Policies
export const getPolicies = async () => {
    const { data, error } = await supabase
        .rpc('get_policies_for_user')
        .select('*, clients(nombre), products(nombre, categoria)'); 
    if (error) throw error;
    return data as unknown as Policy[];
};

export const createPolicy = async (policyData: Omit<Policy, 'id' | 'created_at' | 'clients' | 'products'>) => {
    const { data, error } = await supabase.rpc('create_policy_secure', {
        p_client_id: policyData.client_id,
        p_product_id: policyData.product_id,
        p_prima_total: policyData.prima_total,
        p_fecha_emision: policyData.fecha_emision,
        p_fecha_vencimiento: policyData.fecha_vencimiento,
        p_estatus_poliza: policyData.estatus_poliza,
        p_agent_id: policyData.agent_id || null,
        p_comision_agente: policyData.comision_agente || 0,
        p_productos_detalle: policyData.productos_detalle || [],
        p_suma_asegurada_total: policyData.suma_asegurada_total || 0
    }).single();
    if (error) throw error;
    return data as Policy;
};

export const updatePolicy = async (id: number, updates: Omit<Policy, 'id' | 'created_at' | 'clients' | 'products'>) => {
    const { data, error } = await supabase.rpc('update_policy_secure', {
        p_id: id,
        p_client_id: updates.client_id,
        p_product_id: updates.product_id,
        p_prima_total: updates.prima_total,
        p_fecha_emision: updates.fecha_emision,
        p_fecha_vencimiento: updates.fecha_vencimiento,
        p_estatus_poliza: updates.estatus_poliza,
        p_agent_id: updates.agent_id || null,
        p_comision_agente: updates.comision_agente || 0,
        p_productos_detalle: updates.productos_detalle || [],
        p_suma_asegurada_total: updates.suma_asegurada_total || 0
    }).single();
    if (error) throw error;
    return data as Policy;
};

export const deletePolicy = async (id: number) => {
    const { error } = await supabase.rpc('delete_policy_secure', { p_id: id });
    if (error) throw error;
    await logActivity('DELETE', 'POLICY', String(id));
};

// Storage
export const uploadFile = async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: true
    });
    if (error) throw error;
    return data;
};

export const getFiles = async (bucket: string, path: string): Promise<FileObject[]> => {
    const { data, error } = await supabase.storage.from(bucket).list(path, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw error;
    return (data as FileObject[]) || [];
};

export const getPublicUrl = (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
};

export const downloadFile = async (bucket: string, path: string, fileName: string) => {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error) throw error;
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};


// Products
export const getProducts = async () => {
    const { data, error } = await supabase.rpc('get_products_for_user');
    if (error) throw error;
    return data as Product[];
};

export const createProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.rpc('create_product_secure', {
        p_nombre: productData.nombre,
        p_aseguradora: productData.aseguradora,
        p_categoria: productData.categoria,
        p_comision_porcentaje: productData.comision_porcentaje,
        p_prima_mensual: productData.prima_mensual, 
        p_activo: productData.activo,
        p_descripcion: productData.descripcion,
        p_suma_asegurada: productData.suma_asegurada || 0 
    }).single();
    if (error) throw error;
    return data as Product;
};

export const updateProduct = async (id: number, updates: Partial<Product>) => {
    const { data, error } = await supabase.rpc('update_product_secure', {
        p_id: id,
        p_nombre: updates.nombre,
        p_aseguradora: updates.aseguradora,
        p_categoria: updates.categoria,
        p_comision_porcentaje: updates.comision_porcentaje,
        p_prima_mensual: updates.prima_mensual, 
        p_activo: updates.activo,
        p_descripcion: updates.descripcion,
        p_suma_asegurada: updates.suma_asegurada || 0 
    }).single();
    if (error) throw error;
    return data as Product;
};

export const deleteProduct = async (id: number) => {
    const { error } = await supabase.rpc('delete_product_secure', { p_id: id });
    if (error) throw error;
};

// Tasks
export const getTasks = async () => {
    const { data, error } = await supabase.rpc('get_tasks_for_user');
    if (error) throw error;
    return data as unknown as Task[];
};

export const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'leads' | 'clients'>) => {
    const { data, error } = await supabase.rpc('create_task_secure', {
        p_descripcion: taskData.descripcion,
        p_tipo: taskData.tipo,
        p_fecha_vencimiento: taskData.fecha_vencimiento,
        p_prioridad: taskData.prioridad,
        p_estatus: taskData.estatus,
        p_lead_id: taskData.lead_id || null,
        p_client_id: taskData.client_id || null,
        p_agent_id: taskData.agent_id || null 
    }).single();
    if (error) throw error;
    return data as Task;
};

export const updateTask = async (id: number, updates: Omit<Task, 'id' | 'created_at' | 'leads' | 'clients'>) => {
    const { data, error } = await supabase.rpc('update_task_secure', {
        p_id: id,
        p_descripcion: updates.descripcion,
        p_tipo: updates.tipo,
        p_fecha_vencimiento: updates.fecha_vencimiento,
        p_prioridad: updates.prioridad,
        p_estatus: updates.estatus,
        p_lead_id: updates.lead_id || null,
        p_client_id: updates.client_id || null,
        p_agent_id: updates.agent_id || null 
    }).single();
    if (error) throw error;
    return data as Task;
};

export const deleteTask = async (id: number) => {
    const { error } = await supabase.rpc('delete_task_secure', { p_id: id });
    if (error) throw error;
    await logActivity('DELETE', 'TASK', String(id));
};

// Dashboard
export const getDashboardStats = async () => {
    const { data, error } = await supabase.rpc('get_dashboard_stats_for_user').single();
    if (error) throw error;
    return data as { leads: number; tasks: number; policies: number; commissions: number };
};

export const getLeadsByStatus = async () => {
    const { data, error } = await supabase.rpc('get_leads_by_status_for_user');
    if (error) throw error;
    return data as Record<string, number>;
};

// Monthly Goals (New DB-backed logic)
export const getMonthlyGoal = async (month: number, year: number): Promise<MonthlyGoal | null> => {
    const { data, error } = await supabase.rpc('get_monthly_goal', {
        p_month: month,
        p_year: year
    });
    // It returns null if no row found, which is fine
    if (error) throw error;
    return data as MonthlyGoal | null;
};

export const saveMonthlyGoal = async (goal: MonthlyGoal): Promise<MonthlyGoal> => {
    const { data, error } = await supabase.rpc('upsert_monthly_goal', {
        p_month: goal.month,
        p_year: goal.year,
        p_vida: goal.vida,
        p_ap: goal.ap,
        p_salud: goal.salud
    });
    if (error) throw error;
    return data as MonthlyGoal;
};


// Reports
export const getExpiringPolicies = async (days: number) => {
    const { data, error } = await supabase.rpc('get_expiring_policies_for_user', { days_in_future: days });
    if (error) throw error;
    return data as unknown as Policy[];
}
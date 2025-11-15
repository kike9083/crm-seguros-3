import { supabase } from './supabaseClient';
import { Lead, Client, Policy, Task, Product, Profile, UserRole, FileObject, Team } from '../types';
import { AuthError, Session, User } from '@supabase/supabase-js';

// Re-export supabase client for direct use in other modules if needed
export { supabase };

// Utility to get a readable error message
export const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'Ocurrió un error inesperado. Por favor, revise la consola para más detalles.';
};


// Auth
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
                rol: 'AGENTE' // Default role for new signups
            }
        }
    });
    return { user: data?.user ?? null, error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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

// Profiles
export const getProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase.rpc('get_profile_for_user', { p_user_id: userId }).single();
    
    // The AuthProvider will fall back to using user_metadata if this fails, 
    // making the app more resilient to database issues like RLS recursion.
    if (error) {
        // FIX: Simplify console log to prevent "[object Object]" display issues.
        // The browser console can render the error object inspectable on its own.
        console.error("Error fetching profile via RPC:", error);
        return null;
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

export const createNewUser = async (email: string, password: string, nombre: string, rol: UserRole, team_id: string | null) => {
     // This is a Supabase Edge Function that handles user creation securely.
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                nombre,
                rol,
                team_id,
            },
        },
    });
    
    if (error) throw error;
    
    // The trigger `on_auth_user_created` will handle inserting into public.profiles
    return data;
}

// Leads
export const getLeads = async () => {
    const { data, error } = await supabase.rpc('get_leads_for_user');
    if (error) throw error;
    return data as Lead[];
};

export const createLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'agent_id' | 'team_id'>) => {
    const { data, error } = await supabase.rpc('create_lead_secure', {
        p_nombre: leadData.nombre,
        p_email: leadData.email,
        p_telefono: leadData.telefono,
        p_fuente: leadData.fuente,
        p_estatus_lead: leadData.estatus_lead,
        p_notas: leadData.notas
    }).single();
    if (error) throw error;
    return data as Lead;
};

export const updateLead = async (id: number, updates: Omit<Lead, 'id' | 'created_at' | 'agent_id' | 'team_id'>) => {
    const { data, error } = await supabase.rpc('update_lead_secure', {
        p_id: id,
        p_nombre: updates.nombre,
        p_email: updates.email,
        p_telefono: updates.telefono,
        p_fuente: updates.fuente,
        p_estatus_lead: updates.estatus_lead,
        p_notas: updates.notas || ''
    }).single();
    if (error) throw error;
    return data as Lead;
};

export const deleteLead = async (id: number) => {
    const { error } = await supabase.rpc('delete_lead_secure', { p_id: id });
    if (error) throw error;
};

export const promoteLeadToClient = async (leadId: number) => {
    const { data, error } = await supabase.rpc('promote_lead_to_client', { p_lead_id: leadId });
    if (error) throw error;
    return data;
};

// Clients
export const getClients = async () => {
    const { data, error } = await supabase.rpc('get_clients_for_user');
    if (error) throw error;
    return data as Client[];
};

export const updateClient = async (id: number, updates: Omit<Client, 'id' | 'created_at' | 'lead_origen_id' | 'agent_id' | 'team_id'>) => {
    const { data, error } = await supabase.rpc('update_client_secure', {
        p_id: id,
        p_nombre: updates.nombre,
        p_email: updates.email,
        p_telefono: updates.telefono,
        p_fecha_nacimiento: updates.fecha_nacimiento || null
    }).single();
    if (error) throw error;
    return data as Client;
};

export const deleteClient = async (id: number) => {
    const { error } = await supabase.rpc('delete_client_secure', { p_id: id });
    if (error) throw error;
};

// Policies
export const getPolicies = async () => {
    const { data, error } = await supabase.rpc('get_policies_for_user');
    if (error) throw error;
    return data as unknown as Policy[];
};

export const createPolicy = async (policyData: Omit<Policy, 'id' | 'created_at' | 'clients' | 'products' | 'comision_agente' | 'agent_id' | 'team_id'>) => {
    const { data, error } = await supabase.rpc('create_policy_secure', {
        p_client_id: policyData.client_id,
        p_product_id: policyData.product_id,
        p_prima_total: policyData.prima_total,
        p_fecha_emision: policyData.fecha_emision,
        p_fecha_vencimiento: policyData.fecha_vencimiento,
        p_estatus_poliza: policyData.estatus_poliza
    }).single();
    if (error) throw error;
    return data as Policy;
};

export const updatePolicy = async (id: number, updates: Omit<Policy, 'id' | 'created_at' | 'clients' | 'products' | 'comision_agente' | 'agent_id' | 'team_id'>) => {
    const { data, error } = await supabase.rpc('update_policy_secure', {
        p_id: id,
        p_client_id: updates.client_id,
        p_product_id: updates.product_id,
        p_prima_total: updates.prima_total,
        p_fecha_emision: updates.fecha_emision,
        p_fecha_vencimiento: updates.fecha_vencimiento,
        p_estatus_poliza: updates.estatus_poliza
    }).single();
    if (error) throw error;
    return data as Policy;
};

export const deletePolicy = async (id: number) => {
    const { error } = await supabase.rpc('delete_policy_secure', { p_id: id });
    if (error) throw error;
};

// Storage
export const uploadFile = async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
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


// Products
export const getProducts = async () => {
    const { data, error } = await supabase.rpc('get_all_products');
    if (error) throw error;
    return data as Product[];
};

export const createProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.rpc('create_product_secure', {
        p_nombre: productData.nombre,
        p_aseguradora: productData.aseguradora,
        p_categoria: productData.categoria,
        p_comision_porcentaje: productData.comision_porcentaje,
        p_precio_base: productData.precio_base,
        p_activo: productData.activo,
        p_descripcion: productData.descripcion
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
        p_precio_base: updates.precio_base,
        p_activo: updates.activo,
        p_descripcion: updates.descripcion
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

export const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'leads' | 'clients' | 'agent_id' | 'team_id'>) => {
    const { data, error } = await supabase.rpc('create_task_secure', {
        p_descripcion: taskData.descripcion,
        p_tipo: taskData.tipo,
        p_fecha_vencimiento: taskData.fecha_vencimiento,
        p_prioridad: taskData.prioridad,
        p_estatus: taskData.estatus,
        p_lead_id: taskData.lead_id || null,
        p_client_id: taskData.client_id || null
    }).single();
    if (error) throw error;
    return data as Task;
};

export const updateTask = async (id: number, updates: Omit<Task, 'id' | 'created_at' | 'leads' | 'clients' | 'agent_id' | 'team_id'>) => {
    const { data, error } = await supabase.rpc('update_task_secure', {
        p_id: id,
        p_descripcion: updates.descripcion,
        p_tipo: updates.tipo,
        p_fecha_vencimiento: updates.fecha_vencimiento,
        p_prioridad: updates.prioridad,
        p_estatus: updates.estatus,
        p_lead_id: updates.lead_id || null,
        p_client_id: updates.client_id || null
    }).single();
    if (error) throw error;
    return data as Task;
};

export const deleteTask = async (id: number) => {
    const { error } = await supabase.rpc('delete_task_secure', { p_id: id });
    if (error) throw error;
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


// Reports
export const getExpiringPolicies = async (days: number) => {
    const { data, error } = await supabase.rpc('get_expiring_policies_for_user', { days_in_future: days });
    if (error) throw error;
    return data as unknown as Policy[];
}

// Teams
export const getTeams = async (): Promise<Team[]> => {
    const { data, error } = await supabase.rpc('get_teams');
    if (error) throw error;
    return data as Team[];
}

export const createTeam = async (name: string): Promise<Team> => {
    const { data, error } = await supabase.rpc('create_team', { p_name: name }).single();
    if (error) throw error;
    return data as Team;
}

export const updateTeam = async (id: string, name: string): Promise<Team> => {
    const { data, error } = await supabase.rpc('update_team', { p_id: id, p_name: name }).single();
    if (error) throw error;
    return data as Team;
}

export const deleteTeam = async (id: string) => {
    const { error } = await supabase.rpc('delete_team', { p_id: id });
    if (error) throw error;
}

export const updateUserTeam = async (userId: string, teamId: string | null) => {
    const { error } = await supabase.rpc('update_user_team', { p_user_id: userId, p_team_id: teamId });
    if (error) throw error;
}
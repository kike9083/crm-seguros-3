import { supabase } from './supabaseClient';
import { Lead, Client, Policy, Task, Product } from '../types';

// Leads
export const getLeads = async () => {
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Lead[];
};

export const createLead = async (leadData: Omit<Lead, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('leads').insert([leadData]).select();
    if (error) throw error;
    return data[0] as Lead;
};

type LeadUpdatePayload = Partial<Omit<Lead, 'id' | 'created_at'>>;
export const updateLead = async (id: number, updates: LeadUpdatePayload) => {
    const { data, error } = await supabase.from('leads').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0] as Lead;
};

export const promoteLeadToClient = async (leadId: number) => {
    const { data, error } = await supabase.rpc('promote_lead_to_client', { p_lead_id: leadId });
    if (error) throw error;
    return data;
};

// Clients
export const getClients = async () => {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('nombre', { ascending: true });
    if (error) throw error;
    return data as Client[];
};

type ClientUpdatePayload = Partial<Omit<Client, 'id' | 'created_at' | 'lead_origen_id'>>;
export const updateClient = async (id: number, updates: ClientUpdatePayload) => {
    const { data, error } = await supabase.from('clients').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0] as Client;
};

// Policies
export const getPolicies = async () => {
    const { data, error } = await supabase
        .from('policies')
        .select(`
            *,
            clients (nombre),
            products (nombre)
        `)
        .order('fecha_vencimiento', { ascending: true });
    if (error) throw error;
    return data as Policy[];
};

export const createPolicy = async (policyData: Omit<Policy, 'id' | 'created_at' | 'clients' | 'products' | 'comision_agente'>) => {
    const { data, error } = await supabase.from('policies').insert([policyData]).select();
    if (error) throw error;
    return data[0] as Policy;
};

type PolicyUpdatePayload = Partial<Omit<Policy, 'id' | 'created_at' | 'clients' | 'products' | 'comision_agente'>>;
export const updatePolicy = async (id: number, updates: PolicyUpdatePayload) => {
    const { data, error } = await supabase.from('policies').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0] as Policy;
};


// Products
export const getProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('nombre');
    if (error) throw error;
    return data as Product[];
};

export const createProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('products').insert([productData]).select();
    if (error) throw error;
    return data[0] as Product;
};

export const updateProduct = async (id: number, updates: Partial<Product>) => {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0] as Product;
};

export const deleteProduct = async (id: number) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
};

// Tasks
export const getTasks = async () => {
    const { data, error } = await supabase
        .from('follow_ups')
        .select(`
            *,
            leads (nombre),
            clients (nombre)
        `)
        .order('fecha_vencimiento', { ascending: true });

    if (error) throw error;
    return data as Task[];
};

export const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'leads' | 'clients'>) => {
    const { data, error } = await supabase.from('follow_ups').insert([taskData]).select();
    if (error) throw error;
    return data[0] as Task;
};

type TaskUpdatePayload = Partial<Omit<Task, 'id' | 'created_at' | 'leads' | 'clients'>>;
export const updateTask = async (id: number, updates: TaskUpdatePayload) => {
    const { data, error } = await supabase.from('follow_ups').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0] as Task;
};

// Dashboard
export const getDashboardStats = async () => {
    const { count: leadCount, error: leadError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('estatus_lead', 'NUEVO');
    
    const { count: taskCount, error: taskError } = await supabase
        .from('follow_ups')
        .select('*', { count: 'exact', head: true })
        .eq('estatus', 'PENDIENTE');

    const { data: policiesData, error: policyError } = await supabase
        .from('policies')
        .select('prima_total, comision_agente')
        .eq('estatus_poliza', 'ACTIVA');

    if (leadError) throw leadError;
    if (taskError) throw taskError;
    if (policyError) throw policyError;

    const totalCommissions = policiesData?.reduce((sum, policy) => sum + (policy.comision_agente || 0), 0) ?? 0;
    
    return {
        leads: leadCount ?? 0,
        tasks: taskCount ?? 0,
        policies: policiesData?.length ?? 0,
        commissions: totalCommissions,
    };
};

export const getUpcomingTasks = async () => {
    const today = new Date().toISOString();
    const { data, error } = await supabase
        .from('follow_ups')
        .select('*, leads(nombre), clients(nombre)')
        .eq('estatus', 'PENDIENTE')
        .gte('fecha_vencimiento', today)
        .order('fecha_vencimiento', { ascending: true })
        .limit(5);
    if (error) throw error;
    return data as Task[];
};

export const getLeadsByStatus = async () => {
    const { data, error } = await supabase.from('leads').select('estatus_lead');
    if (error) throw error;
    const counts = data.reduce((acc, lead) => {
        acc[lead.estatus_lead] = (acc[lead.estatus_lead] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    return counts;
};


// Reports
export const getExpiringPolicies = async (days: number) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    const { data, error } = await supabase
        .from('policies')
        .select('*, clients(nombre), products(nombre)')
        .eq('estatus_poliza', 'ACTIVA')
        .lte('fecha_vencimiento', futureDate.toISOString())
        .gte('fecha_vencimiento', today.toISOString())
        .order('fecha_vencimiento', { ascending: true });
        
    if (error) throw error;
    return data as Policy[];
}
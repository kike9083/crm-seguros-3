import React, { useState, useEffect, useMemo } from 'react';
import { 
    getExpiringPolicies, 
    getErrorMessage, 
    getAllProfiles, 
    getLeads, 
    getClients, 
    getPolicies, 
    getTasks 
} from '../services/api';
import { Policy, Profile, Lead, Client, Task } from '../types';
import Spinner from './Spinner';
import { STATUS_COLORS } from '../constants';
import { useAuth } from './auth/AuthContext';

const Reports: React.FC = () => {
    const { profile } = useAuth();
    const isAdmin = profile?.rol === 'ADMIN';

    // Data States
    const [expiringPolicies, setExpiringPolicies] = useState<Policy[]>([]);
    const [allPolicies, setAllPolicies] = useState<Policy[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    
    // UI States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [days, setDays] = useState(30);

    const agentMap = useMemo(() => {
        const map = new Map<string, string>();
        profiles.forEach(p => map.set(p.id, p.nombre));
        return map;
    }, [profiles]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [
                    expiringData, 
                    profilesData,
                    leadsData,
                    clientsData,
                    policiesData,
                    tasksData
                ] = await Promise.all([
                    getExpiringPolicies(days),
                    getAllProfiles(),
                    getLeads(),
                    getClients(),
                    getPolicies(),
                    getTasks()
                ]);

                setExpiringPolicies(expiringData);
                setProfiles(profilesData);
                setLeads(leadsData);
                setClients(clientsData);
                setAllPolicies(policiesData as unknown as Policy[]);
                setTasks(tasksData as unknown as Task[]);

            } catch (err) {
                setError(`Error cargando reportes: ${getErrorMessage(err)}`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [days]);

    // --- KPI CALCULATIONS ---
    const kpis = useMemo(() => {
        const totalPrima = allPolicies
            .filter(p => p.estatus_poliza === 'ACTIVA')
            .reduce((sum, p) => sum + Number(p.prima_total), 0);

        const wonLeads = leads.filter(l => l.estatus_lead === 'GANADO').length;
        const conversionRate = leads.length > 0 ? ((wonLeads / leads.length) * 100).toFixed(1) : '0';

        const completedTasks = tasks.filter(t => t.estatus === 'COMPLETADA').length;
        const taskCompletionRate = tasks.length > 0 ? ((completedTasks / tasks.length) * 100).toFixed(1) : '0';

        return {
            totalPrima,
            totalClients: clients.length,
            conversionRate,
            taskCompletionRate
        };
    }, [allPolicies, leads, clients, tasks]);

    // --- CHART DATA GENERATION ---
    const leadsByStatus = useMemo(() => {
        const counts: Record<string, number> = {};
        leads.forEach(l => {
            counts[l.estatus_lead] = (counts[l.estatus_lead] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]); // Descending
    }, [leads]);

    const policiesByStatus = useMemo(() => {
        const counts: Record<string, number> = {};
        allPolicies.forEach(p => {
            counts[p.estatus_poliza] = (counts[p.estatus_poliza] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [allPolicies]);

    // --- HELPER FOR NAMES ---
    const getRelatedName = (relation: { nombre: string } | { nombre: string }[] | null | undefined): string => {
        if (!relation) return 'N/A';
        if (Array.isArray(relation)) {
            return relation.length > 0 ? relation[0].nombre : 'N/A';
        }
        return relation.nombre;
    };

    // --- EXPORT FUNCTIONS ---
    const downloadCSV = (data: any[], filename: string) => {
        if (!data.length) {
            alert("No hay datos para exportar.");
            return;
        }
        
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','), // Header row
            ...data.map(row => headers.map(fieldName => {
                let val = row[fieldName];
                // Escape quotes and wrap in quotes for CSV safety
                const escaped = ('' + (val ?? '')).replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(','))
        ];

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportLeads = () => {
        const data = leads.map(l => ({
            ID: l.id,
            Nombre: l.nombre,
            Email: l.email,
            Telefono: l.telefono,
            Fuente: l.fuente,
            Estatus: l.estatus_lead,
            Agente: agentMap.get(l.agent_id || '') || 'N/A',
            Fecha_Creacion: l.created_at
        }));
        downloadCSV(data, 'leads_export');
    };

    const exportClients = () => {
        const data = clients.map(c => ({
            ID: c.id,
            Nombre: c.nombre,
            Email: c.email,
            Telefono: c.telefono,
            Ocupacion: c.ocupacion || '',
            Ingresos: c.ingresos_mensuales || 0,
            Agente: agentMap.get(c.agent_id || '') || 'N/A',
            Fecha_Alta: c.created_at
        }));
        downloadCSV(data, 'clientes_export');
    };

    const exportPolicies = () => {
        const data = allPolicies.map(p => ({
            ID: p.id,
            Cliente: getRelatedName(p.clients), 
            Producto: getRelatedName(p.products),
            Prima: p.prima_total,
            Comision: p.comision_agente,
            Estatus: p.estatus_poliza,
            Inicio: p.fecha_emision,
            Fin: p.fecha_vencimiento,
            Agente: agentMap.get(p.agent_id || '') || 'N/A'
        }));
        downloadCSV(data, 'polizas_export');
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Reportes Inteligentes</h1>
                    <p className="text-text-secondary">Visión 360° de tu negocio.</p>
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card p-4 rounded-lg shadow border border-border">
                    <p className="text-text-secondary text-xs uppercase font-bold">Ventas Totales (Primas)</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">${kpis.totalPrima.toLocaleString()}</p>
                </div>
                <div className="bg-card p-4 rounded-lg shadow border border-border">
                    <p className="text-text-secondary text-xs uppercase font-bold">Clientes Activos</p>
                    <p className="text-2xl font-bold text-blue-400 mt-1">{kpis.totalClients}</p>
                </div>
                <div className="bg-card p-4 rounded-lg shadow border border-border">
                    <p className="text-text-secondary text-xs uppercase font-bold">Conversión de Leads</p>
                    <p className="text-2xl font-bold text-purple-400 mt-1">{kpis.conversionRate}%</p>
                </div>
                <div className="bg-card p-4 rounded-lg shadow border border-border">
                    <p className="text-text-secondary text-xs uppercase font-bold">Efectividad Tareas</p>
                    <p className="text-2xl font-bold text-yellow-400 mt-1">{kpis.taskCompletionRate}%</p>
                </div>
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leads Chart */}
                <div className="bg-card p-6 rounded-lg shadow border border-border">
                    <h3 className="text-lg font-bold mb-4">Leads por Estatus</h3>
                    <div className="space-y-3">
                        {leadsByStatus.map(([status, count]) => {
                            const percentage = (count / leads.length) * 100;
                            return (
                                <div key={status} className="w-full">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-text-secondary">{status}</span>
                                        <span className="text-text-primary">{count} ({percentage.toFixed(0)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                                        <div 
                                            className={`h-2.5 rounded-full ${STATUS_COLORS[status as any] || 'bg-gray-500'}`} 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                        {leads.length === 0 && <p className="text-text-secondary text-sm">No hay datos de leads.</p>}
                    </div>
                </div>

                {/* Policies Chart */}
                <div className="bg-card p-6 rounded-lg shadow border border-border">
                    <h3 className="text-lg font-bold mb-4">Pólizas por Estatus</h3>
                    <div className="space-y-3">
                        {policiesByStatus.map(([status, count]) => {
                            const percentage = (count / allPolicies.length) * 100;
                            let color = 'bg-gray-500';
                            if(status === 'ACTIVA') color = 'bg-green-500';
                            if(status === 'PENDIENTE PAGO') color = 'bg-yellow-500';
                            if(status === 'CANCELADA') color = 'bg-red-500';

                            return (
                                <div key={status} className="w-full">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-text-secondary">{status}</span>
                                        <span className="text-text-primary">{count} ({percentage.toFixed(0)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                                        <div 
                                            className={`h-2.5 rounded-full ${color}`} 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                         {allPolicies.length === 0 && <p className="text-text-secondary text-sm">No hay datos de pólizas.</p>}
                    </div>
                </div>
            </div>

            {/* EXPIRING POLICIES TABLE */}
            <div className="bg-card p-6 rounded-lg shadow-lg border border-border">
                <div className="flex items-center justify-between mb-4">
                     <h2 className="text-xl font-bold">Alertas: Pólizas Próximas a Vencer</h2>
                     <select value={days} onChange={e => setDays(Number(e.target.value))} className="bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                         <option value={30}>Próximos 30 días</option>
                         <option value={60}>Próximos 60 días</option>
                         <option value={90}>Próximos 90 días</option>
                     </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-border bg-secondary bg-opacity-30">
                            <tr>
                                <th className="p-3 text-sm">Cliente</th>
                                <th className="p-3 text-sm">Producto</th>
                                <th className="p-3 text-sm">Agente</th>
                                <th className="p-3 text-sm">Vencimiento</th>
                                <th className="p-3 text-sm text-center">Días</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expiringPolicies.map(policy => {
                                const remainingDays = Math.ceil((new Date(policy.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                                return (
                                <tr key={policy.id} className="border-b border-border hover:bg-secondary transition-colors">
                                    <td className="p-3 text-sm font-medium">{getRelatedName(policy.clients)}</td>
                                    <td className="p-3 text-sm text-text-secondary">{getRelatedName(policy.products)}</td>
                                    <td className="p-3 text-sm text-blue-300">{policy.agent_id ? agentMap.get(policy.agent_id) : 'N/A'}</td>
                                    <td className="p-3 text-sm text-text-secondary">{new Date(policy.fecha_vencimiento).toLocaleDateString()}</td>
                                    <td className="p-3 text-center">
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${remainingDays < 15 ? 'bg-red-900 text-red-200' : 'bg-yellow-900 text-yellow-200'}`}>
                                            {remainingDays} días
                                        </span>
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {expiringPolicies.length === 0 && (
                        <p className="text-center p-8 text-text-secondary">¡Todo en orden! No hay renovaciones pendientes en este periodo.</p>
                    )}
                 </div>
            </div>

            {/* EXPORT SECTION */}
            {isAdmin && (
                <div className="bg-secondary p-6 rounded-lg shadow-lg border border-border">
                    <h2 className="text-xl font-bold mb-2">Exportar Datos</h2>
                    <p className="text-text-secondary mb-6 text-sm">Descarga la información completa de tu cartera para análisis externo o copias de seguridad.</p>
                    <div className="flex flex-wrap gap-4">
                        <button 
                            onClick={exportLeads}
                            className="flex items-center bg-card hover:bg-gray-700 border border-border text-text-primary font-bold py-2 px-4 rounded transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Exportar Leads (CSV)
                        </button>
                        <button 
                            onClick={exportClients}
                            className="flex items-center bg-card hover:bg-gray-700 border border-border text-text-primary font-bold py-2 px-4 rounded transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Exportar Clientes (CSV)
                        </button>
                        <button 
                            onClick={exportPolicies}
                            className="flex items-center bg-card hover:bg-gray-700 border border-border text-text-primary font-bold py-2 px-4 rounded transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Exportar Pólizas (CSV)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
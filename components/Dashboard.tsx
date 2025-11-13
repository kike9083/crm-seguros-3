import React, { useState, useEffect } from 'react';
import { getDashboardStats, getUpcomingTasks, getLeadsByStatus, getErrorMessage } from '../services/api';
import { Task } from '../types';
import { LEAD_STATUSES, STATUS_COLORS } from '../constants';
import Spinner from './Spinner';

interface Stats {
    leads: number;
    tasks: number;
    policies: number;
    commissions: number;
}
interface PipelineData {
    [key: string]: number;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-card p-6 rounded-lg shadow-lg flex items-center space-x-4">
        <div className="bg-primary p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-text-secondary text-sm">{title}</p>
            <p className="text-3xl font-bold text-text-primary">{value}</p>
        </div>
    </div>
);

const UpcomingTask: React.FC<{ task: Task }> = ({ task }) => {
    // Handle cases where related leads/clients can be an array.
    const getRelatedName = (relation: { nombre: string } | { nombre: string }[] | null | undefined): string | null => {
        if (!relation) return null;
        if (Array.isArray(relation)) {
            return relation.length > 0 ? relation[0].nombre : null;
        }
        return relation.nombre;
    };
     const contactName = getRelatedName(task.leads) || getRelatedName(task.clients) || 'N/A';
     const dueDate = new Date(task.fecha_vencimiento);
     const now = new Date();
     const isDueSoon = (dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24) < 3;
     const dateColor = isDueSoon ? 'text-yellow-400' : 'text-text-secondary';
    return (
        <div className="flex justify-between items-center py-3 border-b border-border">
            <div>
                <p className="font-semibold">{task.descripcion}</p>
                <p className="text-sm text-text-secondary">Para: {contactName}</p>
            </div>
            <p className={`text-sm font-medium ${dateColor}`}>{dueDate.toLocaleDateString()}</p>
        </div>
    )
};

const PipelineChart: React.FC<{ data: PipelineData }> = ({ data }) => {
    // FIX: Operator '+' cannot be applied to types 'unknown' and 'number'.
    // Explicitly type the accumulator `sum` to `number` to fix type inference issue.
    // By using the generic parameter on `reduce`, we ensure `total` is correctly typed as a number.
    const total = Object.values(data).reduce<number>((sum, count) => sum + Number(count), 0);
    if (total === 0) return <p className="text-text-secondary">No hay datos de leads para mostrar.</p>;

    return (
        <div className="w-full bg-secondary p-4 rounded-lg">
             <div className="flex w-full h-8 rounded-full overflow-hidden">
                {LEAD_STATUSES.map(status => {
                    const count = data[status] || 0;
                    if (count === 0) return null;
                    // FIX: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
                    // This is fixed by ensuring `total` is correctly calculated as a number above.
                    const percentage = (count / total) * 100;
                    return (
                        <div key={status} className={`${STATUS_COLORS[status]}`} style={{ width: `${percentage}%` }} title={`${status}: ${count}`}></div>
                    )
                })}
            </div>
            <div className="flex flex-wrap justify-center mt-4 gap-x-4 gap-y-2">
                {LEAD_STATUSES.map(status => {
                     const count = data[status] || 0;
                     if (count === 0) return null;
                     return (
                        <div key={status} className="flex items-center text-sm">
                            <span className={`w-3 h-3 rounded-full mr-2 ${STATUS_COLORS[status]}`}></span>
                            <span className="text-text-secondary">{status}:</span>
                            <span className="font-semibold ml-1">{count}</span>
                        </div>
                     )
                })}
            </div>
        </div>
    )
}


const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
    const [pipelineData, setPipelineData] = useState<PipelineData>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [statsData, tasksData, pipelineCounts] = await Promise.all([
                    getDashboardStats(),
                    getUpcomingTasks(),
                    getLeadsByStatus()
                ]);
                setStats(statsData);
                setUpcomingTasks(tasksData);
                setPipelineData(pipelineCounts);
            } catch (err) {
                setError(`No se pudieron cargar los datos del dashboard: ${getErrorMessage(err)}`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Nuevos Leads" value={stats?.leads.toString() ?? '0'} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
                <StatCard title="Tareas Pendientes" value={stats?.tasks.toString() ?? '0'} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} />
                <StatCard title="Pólizas Activas" value={stats?.policies.toString() ?? '0'} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
                <StatCard title="Comisiones Estimadas" value={`$${stats?.commissions.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0'}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-card p-6 rounded-lg shadow-lg">
                     <h2 className="text-xl font-bold mb-4">Progreso del Pipeline</h2>
                     <PipelineChart data={pipelineData} />
                </div>
                 <div className="bg-card p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Próximos Seguimientos</h2>
                    <div className="space-y-2">
                        {upcomingTasks.length > 0 ? (
                            upcomingTasks.map(task => <UpcomingTask key={task.id} task={task} />)
                        ) : (
                            <p className="text-text-secondary">No hay tareas pendientes.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { getTasks, getLeads, getPolicies, getErrorMessage, getMonthlyGoal, saveMonthlyGoal } from '../services/api';
import { Task, Lead, Policy, MonthlyGoal } from '../types';
import Spinner from './Spinner';
import CogIcon from './icons/CogIcon';

interface OperationalStats {
    pendingMeetings: number;
    contactsMade: number;
    interestedLeads: number;
    meetingsThisWeek: number;
}

const GoalSettingModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    currentGoal: MonthlyGoal; 
    onSave: (goal: MonthlyGoal) => void 
}> = ({ isOpen, onClose, currentGoal, onSave }) => {
    const [formData, setFormData] = useState<MonthlyGoal>(currentGoal);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(currentGoal);
    }, [currentGoal]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: Number(e.target.value) });
    };

    const handleSaveClick = async () => {
        setIsSaving(true);
        try {
            await onSave(formData);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-card rounded-lg shadow-2xl p-6 w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4">Configurar Metas Mensuales ($)</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Meta Vida</label>
                        <input type="number" name="vida" value={formData.vida} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Meta AP (Accidentes Personales)</label>
                        <input type="number" name="ap" value={formData.ap} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Meta Salud (GMM)</label>
                        <input type="number" name="salud" value={formData.salud} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="text-text-secondary hover:text-white px-3 py-2" disabled={isSaving}>Cancelar</button>
                    <button onClick={handleSaveClick} className="bg-primary hover:bg-accent text-white font-bold py-2 px-4 rounded" disabled={isSaving}>
                        {isSaving ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string | number; subtext?: string; color?: string }> = ({ title, value, subtext, color = "bg-card" }) => (
    <div className={`${color} p-4 rounded-lg shadow-lg border border-border flex flex-col justify-between h-32`}>
        <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">{title}</p>
        <div>
            <p className="text-3xl font-bold text-text-primary">{value}</p>
            {subtext && <p className="text-xs text-text-secondary mt-1">{subtext}</p>}
        </div>
    </div>
);

const ProgressBar: React.FC<{ label: string; current: number; target: number; colorClass: string }> = ({ label, current, target, colorClass }) => {
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    
    return (
        <div className="mb-4">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-text-primary">{label}</span>
                <span className="text-sm font-medium text-text-secondary">${current.toLocaleString()} / ${target.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [opsStats, setOpsStats] = useState<OperationalStats>({ pendingMeetings: 0, contactsMade: 0, interestedLeads: 0, meetingsThisWeek: 0 });
    const [tasks, setTasks] = useState<Task[]>([]);
    
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [monthlyGoal, setMonthlyGoal] = useState<MonthlyGoal>({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        vida: 0, ap: 0, salud: 0
    });
    const [actualSales, setActualSales] = useState({ vida: 0, ap: 0, salud: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();

                const [allTasks, allLeads, allPolicies, savedGoal] = await Promise.all([
                    getTasks(),
                    getLeads(),
                    getPolicies(),
                    getMonthlyGoal(currentMonth, currentYear)
                ]);

                if (savedGoal) {
                    setMonthlyGoal(savedGoal);
                }

                // Operaciones
                const now = new Date();
                const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); 
                const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
                
                const pendingMeetings = allTasks.filter(t => t.tipo === 'CITA' && t.estatus !== 'COMPLETADA').length;
                const contactsMade = allTasks.filter(t => 
                    (t.tipo === 'LLAMADA' || t.tipo === 'CITA' || t.tipo === 'WHATSAPP') && t.estatus === 'COMPLETADA'
                ).length;
                const interestedLeads = allLeads.filter(l => l.estatus_lead === 'V2' || l.estatus_lead === 'V3').length; 
                const meetingsThisWeek = allTasks.filter(t => {
                    if (t.tipo !== 'CITA') return false;
                    const tDate = new Date(t.fecha_vencimiento);
                    return tDate >= startOfWeek && tDate <= endOfWeek;
                }).length;

                setOpsStats({ pendingMeetings, contactsMade, interestedLeads, meetingsThisWeek });
                setTasks(allTasks);

                // Cálculo de Ventas (Robusto)
                let salesVida = 0;
                let salesAP = 0;
                let salesSalud = 0;

                allPolicies.forEach(p => {
                    // Usar fecha de emisión si existe, sino created_at
                    const pDate = new Date(p.fecha_emision || p.created_at);
                    
                    // Solo sumar si es ACTIVA y del MES/AÑO actual
                    if (p.estatus_poliza === 'ACTIVA' && pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
                         
                         let hasDetails = false;

                         // 1. Intento con nuevo esquema (JSONB)
                         if (p.productos_detalle && p.productos_detalle.length > 0) {
                             hasDetails = true;
                             p.productos_detalle.forEach(prod => {
                                 const cat = (prod.categoria || '').toLowerCase();
                                 const prima = Number(prod.prima_mensual) || 0;
                                 
                                 if (cat.includes('vida') || cat.includes('life')) salesVida += prima;
                                 else if (cat.includes('ap') || cat.includes('accidente')) salesAP += prima;
                                 else if (cat.includes('salud') || cat.includes('gmm') || cat.includes('médico') || cat.includes('medico')) salesSalud += prima;
                             });
                         } 
                         
                         // 2. Fallback a esquema antiguo (Relación) si no hay detalles JSON
                         if (!hasDetails) {
                             const prod = Array.isArray(p.products) ? p.products[0] : p.products;
                             if (prod) {
                                 const category = (prod.categoria || prod.nombre || '').toLowerCase();
                                 // Usar prima_total de la póliza como fallback
                                 const prima = Number(p.prima_total) || 0;

                                 if (category.includes('vida') || category.includes('life')) salesVida += prima;
                                 else if (category.includes('ap') || category.includes('accidente')) salesAP += prima;
                                 else if (category.includes('salud') || category.includes('gmm') || category.includes('médico') || category.includes('medico')) salesSalud += prima;
                             }
                         }
                    }
                });

                setActualSales({ vida: salesVida, ap: salesAP, salud: salesSalud });

            } catch (err) {
                setError(`Error cargando datos: ${getErrorMessage(err)}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSaveGoal = async (goal: MonthlyGoal) => {
        try {
            const saved = await saveMonthlyGoal(goal);
            setMonthlyGoal(saved);
            setShowGoalModal(false);
        } catch (err) {
            alert(`Error: ${getErrorMessage(err)}`);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    const upcomingTasks = tasks
        .filter(task => task.estatus === 'PENDIENTE')
        .sort((a, b) => new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-8 pb-10">
            {/* ... (Rest of Dashboard JSX same as before) ... */}
            <div>
                <h2 className="text-xl font-bold mb-4 text-text-primary">Actividad Operativa</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Reuniones Pendientes" value={opsStats.pendingMeetings} subtext="Citas por realizar" color="bg-secondary" />
                    <StatCard title="Personas Contactadas" value={opsStats.contactsMade} subtext="Actividades completadas" color="bg-secondary" />
                    <StatCard title="Interesados (V2/V3)" value={opsStats.interestedLeads} subtext="Leads avanzados" color="bg-indigo-900" />
                    <StatCard title="Citas Esta Semana" value={opsStats.meetingsThisWeek} subtext="Agenda semanal" color="bg-primary" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-card p-6 rounded-lg shadow-lg relative">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Progreso de Metas Mensuales</h2>
                        <button onClick={() => setShowGoalModal(true)} className="flex items-center text-sm text-accent hover:text-white transition-colors">
                            <CogIcon className="w-5 h-5 mr-1"/> Configurar Meta
                        </button>
                     </div>
                     <div className="space-y-6">
                        <ProgressBar label="Vida" current={actualSales.vida} target={monthlyGoal.vida} colorClass="bg-blue-500" />
                        <ProgressBar label="Accidentes Personales (AP)" current={actualSales.ap} target={monthlyGoal.ap} colorClass="bg-yellow-500" />
                        <ProgressBar label="Gastos Médicos / Salud" current={actualSales.salud} target={monthlyGoal.salud} colorClass="bg-green-500" />
                     </div>
                     <div className="mt-8 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xs text-text-secondary">Meta Total</p>
                            <p className="font-bold text-lg">${(monthlyGoal.vida + monthlyGoal.ap + monthlyGoal.salud).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-text-secondary">Venta Real</p>
                            <p className="font-bold text-lg">${(actualSales.vida + actualSales.ap + actualSales.salud).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-text-secondary">Faltante</p>
                            <p className="font-bold text-lg text-red-400">
                                ${Math.max(0, (monthlyGoal.vida + monthlyGoal.ap + monthlyGoal.salud) - (actualSales.vida + actualSales.ap + actualSales.salud)).toLocaleString()}
                            </p>
                        </div>
                     </div>
                </div>
                 <div className="bg-card p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Próximos Pendientes</h2>
                    <div className="space-y-3">
                        {upcomingTasks.length > 0 ? (
                            upcomingTasks.map(task => {
                                const contactName = Array.isArray(task.leads) ? task.leads[0]?.nombre : task.leads?.nombre || 
                                                    (Array.isArray(task.clients) ? task.clients[0]?.nombre : task.clients?.nombre) || 'N/A';
                                return (
                                    <div key={task.id} className="py-2 border-b border-border last:border-0">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-sm">{task.descripcion}</span>
                                            <span className="text-xs text-text-secondary">{new Date(task.fecha_vencimiento).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-text-secondary mt-1">Con: {contactName}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block ${task.prioridad === 'ALTA' ? 'bg-red-900 text-red-200' : 'bg-gray-700'}`}>
                                            {task.prioridad}
                                        </span>
                                    </div>
                                )
                            })
                        ) : (
                            <p className="text-text-secondary text-sm">No hay tareas pendientes próximas.</p>
                        )}
                    </div>
                </div>
            </div>
            <GoalSettingModal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} currentGoal={monthlyGoal} onSave={handleSaveGoal} />
        </div>
    );
};

export default Dashboard;
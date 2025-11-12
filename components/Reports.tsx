
import React, { useState, useEffect } from 'react';
import { getExpiringPolicies } from '../services/api';
import { Policy } from '../types';
import Spinner from './Spinner';

const Reports: React.FC = () => {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [days, setDays] = useState(30);

    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                setLoading(true);
                const data = await getExpiringPolicies(days);
                setPolicies(data);
            } catch (err) {
                setError('No se pudieron cargar las pólizas por vencer.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPolicies();
    }, [days]);
    
    const getRelatedName = (relation: { nombre: string } | { nombre: string }[] | null | undefined): string => {
        if (!relation) return 'N/A';
        if (Array.isArray(relation)) {
            return relation.length > 0 ? relation[0].nombre : 'N/A';
        }
        return relation.nombre;
    };

    return (
        <div className="bg-card p-6 rounded-lg shadow-lg space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Reportes</h1>
                <p className="text-text-secondary">Analiza el rendimiento y las próximas acciones.</p>
            </div>
            
            <div className="bg-secondary p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                     <h2 className="text-xl font-semibold">Pólizas Próximas a Vencer</h2>
                     <div className="flex items-center space-x-2">
                         <span className="text-sm">Mostrar en los próximos:</span>
                         <select value={days} onChange={e => setDays(Number(e.target.value))} className="bg-card p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                             <option value={30}>30 días</option>
                             <option value={60}>60 días</option>
                             <option value={90}>90 días</option>
                         </select>
                     </div>
                </div>

                {loading ? <div className="flex justify-center items-center h-48"><Spinner /></div> :
                 error ? <p className="text-red-500 text-center">{error}</p> :
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-border">
                            <tr>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Producto</th>
                                <th className="p-4">Fecha Vencimiento</th>
                                <th className="p-4">Días Restantes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policies.map(policy => {
                                const remainingDays = Math.ceil((new Date(policy.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                                return (
                                <tr key={policy.id} className="border-b border-border hover:bg-card">
                                    <td className="p-4 font-medium">{getRelatedName(policy.clients)}</td>
                                    <td className="p-4 text-text-secondary">{getRelatedName(policy.products)}</td>
                                    <td className="p-4 text-text-secondary">{new Date(policy.fecha_vencimiento).toLocaleDateString()}</td>
                                    <td className={`p-4 font-bold ${remainingDays < 15 ? 'text-yellow-400' : 'text-text-secondary'}`}>{remainingDays}</td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {policies.length === 0 && (
                        <p className="text-center p-8 text-text-secondary">No hay pólizas que venzan en este período.</p>
                    )}
                 </div>
                }
            </div>
        </div>
    );
};

export default Reports;

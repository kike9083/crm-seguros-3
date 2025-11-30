import React, { useState, useEffect, useMemo } from 'react';
import { getPolicies, getAllProfiles, getErrorMessage } from '../services/api';
import { Policy, Profile } from '../types';
import Spinner from './Spinner';
import { useAuth } from './auth/AuthContext';

const CommissionsList: React.FC = () => {
    const { profile } = useAuth();
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [policiesData, profilesData] = await Promise.all([
                    getPolicies(),
                    getAllProfiles()
                ]);
                setPolicies(policiesData as unknown as Policy[]);
                setProfiles(profilesData);
            } catch (err) {
                setError(`Error: ${getErrorMessage(err)}`);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const commissionData = useMemo(() => {
        const agentStats: Record<string, { name: string, totalPremium: number, totalCommission: number, count: number }> = {};

        policies.forEach(p => {
            const pDate = new Date(p.created_at);
            if (pDate.getMonth() === selectedMonth && pDate.getFullYear() === selectedYear && p.estatus_poliza === 'ACTIVA') {
                const agentId = p.agent_id || 'unknown';
                const agentName = profiles.find(pr => pr.id === agentId)?.nombre || 'Sin Asignar';

                if (!agentStats[agentId]) {
                    agentStats[agentId] = { name: agentName, totalPremium: 0, totalCommission: 0, count: 0 };
                }

                agentStats[agentId].totalPremium += Number(p.prima_total);
                agentStats[agentId].totalCommission += Number(p.comision_agente);
                agentStats[agentId].count += 1;
            }
        });

        // Filter for current agent if not admin
        if (profile?.rol !== 'ADMIN') {
            const myStats = agentStats[profile?.id || ''];
            return myStats ? [myStats] : [];
        }

        return Object.values(agentStats);
    }, [policies, profiles, selectedMonth, selectedYear, profile]);

    const totalPeriodCommission = commissionData.reduce((sum, item) => sum + item.totalCommission, 0);

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-text-primary">Comisiones</h1>
                <div className="flex space-x-2">
                    <select 
                        value={selectedMonth} 
                        onChange={e => setSelectedMonth(Number(e.target.value))}
                        className="bg-secondary p-2 rounded border border-border"
                    >
                        {Array.from({length: 12}, (_, i) => (
                            <option key={i} value={i}>{new Date(0, i).toLocaleString('es-ES', { month: 'long' })}</option>
                        ))}
                    </select>
                    <select 
                        value={selectedYear} 
                        onChange={e => setSelectedYear(Number(e.target.value))}
                        className="bg-secondary p-2 rounded border border-border"
                    >
                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-border">
                            <tr>
                                <th className="p-4">Agente</th>
                                <th className="p-4">Pólizas Vendidas</th>
                                <th className="p-4">Total Prima Mensual</th>
                                <th className="p-4">Comisión Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {commissionData.map((data, idx) => (
                                <tr key={idx} className="border-b border-border hover:bg-secondary">
                                    <td className="p-4 font-medium">{data.name}</td>
                                    <td className="p-4">{data.count}</td>
                                    <td className="p-4">${data.totalPremium.toLocaleString()}</td>
                                    <td className="p-4 font-bold text-green-400">${data.totalCommission.toLocaleString()}</td>
                                </tr>
                            ))}
                            {commissionData.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-text-secondary">No hay comisiones registradas para este periodo.</td>
                                </tr>
                            )}
                        </tbody>
                        {commissionData.length > 0 && profile?.rol === 'ADMIN' && (
                            <tfoot className="bg-secondary bg-opacity-30 font-bold">
                                <tr>
                                    <td className="p-4" colSpan={3}>TOTAL PERIODO</td>
                                    <td className="p-4 text-green-400">${totalPeriodCommission.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CommissionsList;
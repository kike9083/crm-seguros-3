import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getPolicies, deletePolicy, getErrorMessage, getAllProfiles } from '../services/api';
import { Policy, Profile } from '../types';
import Spinner from './Spinner';
import PlusIcon from './icons/PlusIcon';
import PolicyModal from './PolicyModal';
import ConfirmationModal from './ConfirmationModal';
import { useAuth } from './auth/AuthContext';

const PoliciesList: React.FC = () => {
    const { profile } = useAuth();
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);

    // Estados para filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAgentId, setSelectedAgentId] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const agentMap = React.useMemo(() => {
        const map = new Map<string, string>();
        profiles.forEach(p => map.set(p.id, p.nombre));
        return map;
    }, [profiles]);

    const fetchPoliciesAndProfiles = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [policiesData, profilesData] = await Promise.all([
                getPolicies(),
                getAllProfiles()
            ]);
            setPolicies(policiesData);
            setProfiles(profilesData);
        } catch (err) {
            setError(`No se pudieron cargar las pólizas o perfiles: ${getErrorMessage(err)}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPoliciesAndProfiles();
    }, [fetchPoliciesAndProfiles]);

    // Helper para obtener nombres
    const getRelatedName = useCallback((relation: any): string => {
        if (!relation) return 'N/A';
        if (Array.isArray(relation)) {
            return relation.length > 0 && relation[0].nombre ? relation[0].nombre : 'N/A';
        }
        if (typeof relation === 'object' && relation !== null && relation.nombre) {
            return relation.nombre;
        }
        return 'N/A';
    }, []);

    // Helper para obtener string de productos para búsqueda
    const getProductsString = useCallback((policy: Policy): string => {
        if (policy.productos_detalle && Array.isArray(policy.productos_detalle) && policy.productos_detalle.length > 0) {
            return policy.productos_detalle.map(p => p.nombre).join(' ');
        }
        return getRelatedName(policy.products);
    }, [getRelatedName]);

    // Lógica de filtrado
    const filteredPolicies = useMemo(() => {
        return policies.filter(policy => {
            // 1. Filtro de texto
            const lowerTerm = searchTerm.toLowerCase();
            const clientName = getRelatedName(policy.clients).toLowerCase();
            const productsName = getProductsString(policy).toLowerCase();
            const agentName = policy.agent_id ? agentMap.get(policy.agent_id)?.toLowerCase() : '';
            const status = policy.estatus_poliza.toLowerCase();

            const matchesSearch = !searchTerm || (
                clientName.includes(lowerTerm) ||
                productsName.includes(lowerTerm) ||
                (agentName && agentName.includes(lowerTerm)) ||
                status.includes(lowerTerm)
            );

            // 2. Filtro por Agente
            const matchesAgent = !selectedAgentId || policy.agent_id === selectedAgentId;

            // 3. Filtro por Fecha de Emisión
            let matchesDate = true;
            if (dateFrom || dateTo) {
                const policyDate = new Date(policy.fecha_emision).setHours(0,0,0,0);
                const from = dateFrom ? new Date(dateFrom).setHours(0,0,0,0) : null;
                const to = dateTo ? new Date(dateTo).setHours(0,0,0,0) : null;

                if (from && policyDate < from) matchesDate = false;
                if (to && policyDate > to) matchesDate = false;
            }

            return matchesSearch && matchesAgent && matchesDate;
        });
    }, [policies, searchTerm, selectedAgentId, dateFrom, dateTo, agentMap, getRelatedName, getProductsString]);
    
    const handleOpenModal = (policy: Policy | null) => {
        setSelectedPolicy(policy);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPolicy(null);
    };

    const handleSave = () => {
        handleCloseModal();
        fetchPoliciesAndProfiles();
    };

    const handleDeleteRequest = (policy: Policy) => {
        setPolicyToDelete(policy);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!policyToDelete) return;
        try {
            await deletePolicy(policyToDelete.id);
            fetchPoliciesAndProfiles();
        } catch (err) {
            alert(`No se pudo eliminar la póliza: ${getErrorMessage(err)}`);
        } finally {
            setIsConfirmModalOpen(false);
            setPolicyToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setIsConfirmModalOpen(false);
        setPolicyToDelete(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVA': return 'bg-green-500 text-white';
            case 'PENDIENTE PAGO': return 'bg-yellow-500 text-black';
            case 'CANCELADA': return 'bg-red-500 text-white';
            case 'VENCIDA': return 'bg-gray-500 text-white';
            default: return 'bg-gray-200 text-gray-800';
        }
    };

    const getProductDisplay = (policy: Policy) => {
        if (policy.productos_detalle && Array.isArray(policy.productos_detalle) && policy.productos_detalle.length > 0) {
            return (
                <div className="flex flex-col space-y-1">
                    {policy.productos_detalle.map((prod, idx) => (
                        <span key={idx} className="text-xs bg-gray-700 px-2 py-0.5 rounded inline-block w-fit">
                            {prod.nombre}
                        </span>
                    ))}
                </div>
            );
        }
        return <span className="text-text-secondary">{getRelatedName(policy.products)}</span>;
    };
    
    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-col gap-4 w-full md:w-auto flex-grow">
                    {/* Barra de búsqueda */}
                    <div className="relative w-full md:max-w-md">
                        <input
                            type="text"
                            placeholder="Buscar por cliente, producto, estatus..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-secondary p-2 pl-10 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary text-text-primary placeholder-text-secondary"
                            aria-label="Buscar pólizas"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-text-secondary">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <select
                            value={selectedAgentId}
                            onChange={(e) => setSelectedAgentId(e.target.value)}
                            className="bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        >
                            <option value="">Todos los Agentes</option>
                            {profiles.filter(p => p.rol === 'AGENTE').map(agent => (
                                <option key={agent.id} value={agent.id}>{agent.nombre}</option>
                            ))}
                        </select>

                        <div className="flex items-center gap-2 bg-secondary p-1 rounded border border-border">
                            <span className="text-xs text-text-secondary ml-2">Emisión Desde:</span>
                            <input 
                                type="date" 
                                value={dateFrom} 
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="bg-transparent text-sm p-1 focus:outline-none text-text-primary"
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-secondary p-1 rounded border border-border">
                            <span className="text-xs text-text-secondary ml-2">Hasta:</span>
                            <input 
                                type="date" 
                                value={dateTo} 
                                onChange={(e) => setDateTo(e.target.value)}
                                className="bg-transparent text-sm p-1 focus:outline-none text-text-primary"
                            />
                        </div>
                        {(selectedAgentId || dateFrom || dateTo) && (
                            <button 
                                onClick={() => { setSelectedAgentId(''); setDateFrom(''); setDateTo(''); }}
                                className="text-xs text-red-400 hover:text-red-300 underline ml-2"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => handleOpenModal(null)}
                    className="flex items-center bg-primary hover:bg-accent text-white font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
                >
                    <PlusIcon className="w-5 h-5 mr-2"/>
                    Crear Nueva Póliza
                </button>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-border">
                            <tr>
                                <th className="p-3">Cliente</th>
                                <th className="p-3">Producto(s)</th>
                                <th className="p-3 text-right">Prima Mensual</th>
                                <th className="p-3 text-right">Prima Anual</th>
                                <th className="p-3 text-right">Comisión Mensual</th>
                                <th className="p-3 text-right">Comisión Anual</th>
                                <th className="p-3">Agente</th>
                                <th className="p-3">Vencimiento</th>
                                <th className="p-3">Estatus</th>
                                <th className="p-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPolicies.map(policy => {
                                const monthlyPremium = Number(policy.prima_total);
                                const annualPremium = monthlyPremium * 12;
                                const monthlyCommission = Number(policy.comision_agente);
                                const annualCommission = monthlyCommission * 12;

                                return (
                                <tr key={policy.id} className="border-b border-border hover:bg-secondary">
                                    <td className="p-3 font-medium">{getRelatedName(policy.clients)}</td>
                                    <td className="p-3">
                                        {getProductDisplay(policy)}
                                    </td>
                                    <td className="p-3 text-right font-mono text-text-secondary">
                                        ${monthlyPremium.toLocaleString()}
                                    </td>
                                    <td className="p-3 text-right font-mono text-blue-300">
                                        ${annualPremium.toLocaleString()}
                                    </td>
                                    <td className="p-3 text-right font-mono text-green-400">
                                        ${monthlyCommission.toLocaleString()}
                                    </td>
                                    <td className="p-3 text-right font-mono text-green-300 font-bold">
                                        ${annualCommission.toLocaleString()}
                                    </td>
                                    <td className="p-3 text-blue-300">{policy.agent_id ? agentMap.get(policy.agent_id) : 'N/A'}</td>
                                    <td className="p-3 text-text-secondary text-xs">{new Date(policy.fecha_vencimiento).toLocaleDateString()}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(policy.estatus_poliza)}`}>
                                            {policy.estatus_poliza}
                                        </span>
                                    </td>
                                    <td className="p-3 space-x-2 whitespace-nowrap">
                                        <button onClick={() => handleOpenModal(policy)} className="text-accent hover:underline">Editar</button>
                                        {profile?.rol === 'ADMIN' && (
                                            <button onClick={() => handleDeleteRequest(policy)} className="text-red-500 hover:underline">Eliminar</button>
                                        )}
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredPolicies.length === 0 && (
                        <p className="text-center p-8 text-text-secondary">
                            {searchTerm || selectedAgentId || dateFrom || dateTo
                                ? `No se encontraron pólizas con los filtros seleccionados.` 
                                : 'No se encontraron pólizas.'}
                        </p>
                    )}
                </div>
            </div>
             {isModalOpen && (
                <PolicyModal
                    policy={selectedPolicy}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                title="Confirmar Eliminación de Póliza"
                message={`¿Estás seguro de que quieres eliminar esta póliza? Esta acción no se puede deshacer.`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Eliminar"
            />
        </>
    );
};

export default PoliciesList;
import React, { useState, useEffect, useCallback } from 'react';
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

    // Helper ultra-robusto para obtener nombres de relaciones
    const getRelatedName = (relation: any): string => {
        if (!relation) return 'N/A';
        
        // Caso 1: Es un array (Supabase devuelve esto en joins 1:N o N:N a veces)
        if (Array.isArray(relation)) {
            if (relation.length > 0 && relation[0].nombre) {
                return relation[0].nombre;
            }
            return 'N/A';
        }
        
        // Caso 2: Es un objeto directo
        if (typeof relation === 'object' && relation !== null) {
            if (relation.nombre) return relation.nombre;
        }
        
        return 'N/A';
    };

    // Helper específico para mostrar los productos de la póliza
    const getProductDisplay = (policy: Policy) => {
        // 1. Prioridad: Mostrar desde 'productos_detalle' (nuevo formato multi-producto)
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
        // 2. Fallback: Mostrar desde relación 'products' (legacy)
        return <span className="text-text-secondary">{getRelatedName(policy.products)}</span>;
    };
    
    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <>
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => handleOpenModal(null)}
                    className="flex items-center bg-primary hover:bg-accent text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <PlusIcon className="w-5 h-5 mr-2"/>
                    Crear Nueva Póliza
                </button>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-border">
                            <tr>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Producto(s)</th>
                                <th className="p-4">Prima Total</th>
                                <th className="p-4">Comisión Agente</th>
                                <th className="p-4">Agente</th>
                                <th className="p-4">Fecha Vencimiento</th>
                                <th className="p-4">Estatus</th>
                                <th className="p-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policies.map(policy => (
                                <tr key={policy.id} className="border-b border-border hover:bg-secondary">
                                    <td className="p-4 font-medium">{getRelatedName(policy.clients)}</td>
                                    <td className="p-4">
                                        {getProductDisplay(policy)}
                                    </td>
                                    <td className="p-4 text-text-secondary font-mono">
                                        ${Number(policy.prima_total).toLocaleString()}
                                    </td>
                                    <td className="p-4 text-text-secondary font-mono text-green-400">
                                        ${Number(policy.comision_agente).toLocaleString()}
                                    </td>
                                    <td className="p-4 text-blue-300">{policy.agent_id ? agentMap.get(policy.agent_id) : 'N/A'}</td>
                                    <td className="p-4 text-text-secondary text-sm">{new Date(policy.fecha_vencimiento).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(policy.estatus_poliza)}`}>
                                            {policy.estatus_poliza}
                                        </span>
                                    </td>
                                    <td className="p-4 space-x-2 whitespace-nowrap">
                                        <button onClick={() => handleOpenModal(policy)} className="text-accent hover:underline">Editar</button>
                                        {profile?.rol === 'ADMIN' && (
                                            <button onClick={() => handleDeleteRequest(policy)} className="text-red-500 hover:underline">Eliminar</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {policies.length === 0 && (
                        <p className="text-center p-8 text-text-secondary">No se encontraron pólizas.</p>
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
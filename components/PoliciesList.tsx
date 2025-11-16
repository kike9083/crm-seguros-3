import React, { useState, useEffect, useCallback } from 'react';
import { getPolicies, deletePolicy, getErrorMessage } from '../services/api';
import { Policy } from '../types';
import Spinner from './Spinner';
import PlusIcon from './icons/PlusIcon';
import PolicyModal from './PolicyModal';
import ConfirmationModal from './ConfirmationModal';
import { useAuth } from './auth/AuthContext';

const PoliciesList: React.FC = () => {
    const { profile } = useAuth();
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

     useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    const fetchPolicies = useCallback(async (search: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPolicies(search);
            setPolicies(data);
        } catch (err) {
            setError(`No se pudieron cargar las pólizas: ${getErrorMessage(err)}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPolicies(debouncedSearchTerm);
    }, [fetchPolicies, debouncedSearchTerm]);
    
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
        fetchPolicies(debouncedSearchTerm);
    };

    const handleDeleteRequest = (policy: Policy) => {
        setPolicyToDelete(policy);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!policyToDelete) return;
        try {
            await deletePolicy(policyToDelete.id);
            fetchPolicies(debouncedSearchTerm);
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

    const getRelatedName = (relation: { nombre: string } | { nombre: string }[] | null | undefined): string => {
        if (!relation) return 'N/A';
        if (Array.isArray(relation)) {
            return relation.length > 0 ? relation[0].nombre : 'N/A';
        }
        return relation.nombre;
    };
    
    return (
        <>
            <div className="flex justify-between items-center mb-4">
                 <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Buscar por cliente, producto o agente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-secondary p-2 pl-10 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Buscar pólizas"
                    />
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-text-secondary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="flex items-center bg-primary hover:bg-accent text-white font-bold py-2 px-4 rounded-lg transition-colors flex-shrink-0 ml-4"
                >
                    <PlusIcon className="w-5 h-5 mr-2"/>
                    Crear Póliza
                </button>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                     {loading ? (
                        <div className="flex justify-center items-center h-64"><Spinner /></div>
                    ) : error ? (
                        <p className="text-red-500 text-center col-span-full">{error}</p>
                    ) : (
                    <table className="w-full text-left">
                        <thead className="border-b border-border">
                            <tr>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Producto</th>
                                <th className="p-4">Agente Asignado</th>
                                <th className="p-4">Prima Total</th>
                                <th className="p-4">Comisión Agente</th>
                                <th className="p-4">Fecha Vencimiento</th>
                                <th className="p-4">Estatus</th>
                                <th className="p-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policies.map(policy => (
                                <tr key={policy.id} className="border-b border-border hover:bg-secondary">
                                    <td className="p-4 font-medium">{getRelatedName(policy.clients)}</td>
                                    <td className="p-4 text-text-secondary">{getRelatedName(policy.products)}</td>
                                    <td className="p-4 text-text-secondary">{policy.profiles?.nombre || 'No asignado'}</td>
                                    <td className="p-4 text-text-secondary">${policy.prima_total.toLocaleString()}</td>
                                    <td className="p-4 text-text-secondary">${policy.comision_agente.toLocaleString()}</td>
                                    <td className="p-4 text-text-secondary">{new Date(policy.fecha_vencimiento).toLocaleDateString()}</td>
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
                    )}
                    {!loading && policies.length === 0 && (
                         <p className="text-center p-8 text-text-secondary">
                            {debouncedSearchTerm
                                ? `No se encontraron pólizas para "${debouncedSearchTerm}".`
                                : 'No se encontraron pólizas.'
                            }
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
                message={`¿Estás seguro de que quieres eliminar la póliza para "${getRelatedName(policyToDelete?.clients)}"? Esta acción no se puede deshacer.`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Eliminar"
            />
        </>
    );
};

export default PoliciesList;

import React, { useState, useEffect, useCallback } from 'react';
import { getPolicies } from '../services/api';
import { Policy } from '../types';
import Spinner from './Spinner';
import PlusIcon from './icons/PlusIcon';
import PolicyModal from './PolicyModal';

const PoliciesList: React.FC = () => {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

    const fetchPolicies = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getPolicies();
            setPolicies(data);
        } catch (err) {
            setError('No se pudieron cargar las pólizas.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPolicies();
    }, [fetchPolicies]);
    
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
        fetchPolicies();
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
                                <th className="p-4">Producto</th>
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
                                    <td className="p-4 text-text-secondary">${policy.prima_total.toLocaleString()}</td>
                                    <td className="p-4 text-text-secondary">${policy.comision_agente.toLocaleString()}</td>
                                    <td className="p-4 text-text-secondary">{new Date(policy.fecha_vencimiento).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(policy.estatus_poliza)}`}>
                                            {policy.estatus_poliza}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button onClick={() => handleOpenModal(policy)} className="text-accent hover:underline">Editar</button>
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
        </>
    );
};

export default PoliciesList;
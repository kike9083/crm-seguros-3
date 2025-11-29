import React, { useState, useEffect, useCallback } from 'react';
import { getClients, deleteClient, getErrorMessage, getAllProfiles } from '../services/api';
import { Client, Profile } from '../types';
import Spinner from './Spinner';
import ClientModal from './ClientModal';
import ConfirmationModal from './ConfirmationModal';
import { useAuth } from './auth/AuthContext';

const ClientsList: React.FC = () => {
    const { profile } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

    const agentMap = React.useMemo(() => {
        const map = new Map<string, string>();
        profiles.forEach(p => map.set(p.id, p.nombre));
        return map;
    }, [profiles]);

    const fetchClientsAndProfiles = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [clientsData, profilesData] = await Promise.all([
                getClients(),
                getAllProfiles()
            ]);
            setClients(clientsData);
            setProfiles(profilesData);
        } catch (err) {
            setError(`No se pudieron cargar los clientes o perfiles: ${getErrorMessage(err)}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClientsAndProfiles();
    }, [fetchClientsAndProfiles]);

    const handleOpenModal = (client: Client) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedClient(null);
    };

    const handleSave = () => {
        handleCloseModal();
        fetchClientsAndProfiles();
    };

    const handleDeleteRequest = (client: Client) => {
        setClientToDelete(client);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!clientToDelete) return;
        try {
            await deleteClient(clientToDelete.id);
            fetchClientsAndProfiles();
        } catch (err) {
            alert(`No se pudo eliminar el cliente: ${getErrorMessage(err)}`);
        } finally {
            setIsConfirmModalOpen(false);
            setClientToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setIsConfirmModalOpen(false);
        setClientToDelete(null);
    };


    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <>
            <div className="bg-card p-6 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-border">
                            <tr>
                                <th className="p-4">Nombre</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Teléfono</th>
                                <th className="p-4">Fecha de Alta</th>
                                <th className="p-4">Agente</th>
                                <th className="p-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map(client => (
                                <tr key={client.id} className="border-b border-border hover:bg-secondary">
                                    <td className="p-4 font-medium">{client.nombre}</td>
                                    <td className="p-4 text-text-secondary">{client.email}</td>
                                    <td className="p-4 text-text-secondary">{client.telefono}</td>
                                    <td className="p-4 text-text-secondary">{new Date(client.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 text-blue-300">{client.agent_id ? agentMap.get(client.agent_id) : 'N/A'}</td>
                                    <td className="p-4 space-x-2 whitespace-nowrap">
                                        <button onClick={() => handleOpenModal(client)} className="text-accent hover:underline">Editar</button>
                                        {profile?.rol === 'ADMIN' && (
                                            <button onClick={() => handleDeleteRequest(client)} className="text-red-500 hover:underline">Eliminar</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {clients.length === 0 && (
                        <p className="text-center p-8 text-text-secondary">No se encontraron clientes. Los leads ganados aparecerán aquí.</p>
                    )}
                </div>
            </div>
            {isModalOpen && selectedClient && (
                <ClientModal
                    client={selectedClient}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                title="Confirmar Eliminación de Cliente"
                message={`¿Estás seguro de que quieres eliminar a "${clientToDelete?.nombre}"? Esta acción no se puede deshacer y podría afectar a las pólizas asociadas.`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Eliminar"
            />
        </>
    );
};

export default ClientsList;
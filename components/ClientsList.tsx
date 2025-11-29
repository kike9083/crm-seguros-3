import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    
    // Estado para la búsqueda
    const [searchTerm, setSearchTerm] = useState('');

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

    // Lógica de filtrado
    const filteredClients = useMemo(() => {
        if (!searchTerm) return clients;
        
        const lowerTerm = searchTerm.toLowerCase();
        
        return clients.filter(client => {
            const agentName = client.agent_id ? agentMap.get(client.agent_id)?.toLowerCase() : '';
            
            return (
                client.nombre.toLowerCase().includes(lowerTerm) ||
                client.email.toLowerCase().includes(lowerTerm) ||
                (client.telefono && client.telefono.toLowerCase().includes(lowerTerm)) ||
                (agentName && agentName.includes(lowerTerm))
            );
        });
    }, [clients, searchTerm, agentMap]);

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
            <div className="flex justify-between items-center mb-4">
                <div className="relative w-full max-w-sm">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email, teléfono o agente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-secondary p-2 pl-10 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary text-text-primary placeholder-text-secondary"
                        aria-label="Buscar clientes"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-text-secondary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </div>
                </div>
                {/* Espacio reservado si en el futuro se añade botón de crear cliente manual */}
            </div>

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
                            {filteredClients.map(client => (
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
                    {filteredClients.length === 0 && (
                        <p className="text-center p-8 text-text-secondary">
                            {searchTerm 
                                ? `No se encontraron resultados para "${searchTerm}".` 
                                : 'No se encontraron clientes.'}
                        </p>
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
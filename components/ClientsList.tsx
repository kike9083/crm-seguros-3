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

    // Lógica de filtrado avanzada
    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            // 1. Filtro de texto
            const lowerTerm = searchTerm.toLowerCase();
            const agentName = client.agent_id ? agentMap.get(client.agent_id)?.toLowerCase() : '';
            const matchesSearch = !searchTerm || (
                (client.nombre?.toLowerCase() || '').includes(lowerTerm) ||
                (client.email?.toLowerCase() || '').includes(lowerTerm) ||
                (client.telefono?.toLowerCase() || '').includes(lowerTerm) ||
                (agentName && agentName.includes(lowerTerm))
            );

            // 2. Filtro por Agente
            const matchesAgent = !selectedAgentId || client.agent_id === selectedAgentId;

            // 3. Filtro por Fecha de Creación (Alta)
            let matchesDate = true;
            if (dateFrom || dateTo) {
                const clientDate = new Date(client.created_at).setHours(0,0,0,0);
                const from = dateFrom ? new Date(dateFrom).setHours(0,0,0,0) : null;
                const to = dateTo ? new Date(dateTo).setHours(0,0,0,0) : null;

                if (from && clientDate < from) matchesDate = false;
                if (to && clientDate > to) matchesDate = false;
            }

            return matchesSearch && matchesAgent && matchesDate;
        });
    }, [clients, searchTerm, selectedAgentId, dateFrom, dateTo, agentMap]);

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-col gap-4 w-full md:w-auto flex-grow">
                    {/* Barra de búsqueda */}
                    <div className="relative w-full md:max-w-md">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email, teléfono..."
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
                            <span className="text-xs text-text-secondary ml-2">Desde:</span>
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
                            {searchTerm || selectedAgentId || dateFrom || dateTo
                                ? `No se encontraron clientes con los filtros seleccionados.` 
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
import React, { useState, useEffect, useCallback } from 'react';
import { getClients, deleteClient, getErrorMessage } from '../services/api';
import { Client } from '../types';
import Spinner from './Spinner';
import ClientModal from './ClientModal';
import ConfirmationModal from './ConfirmationModal';
import { useAuth } from './auth/AuthContext';

const ClientsList: React.FC = () => {
    const { profile } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms de retraso

        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    const fetchClients = useCallback(async (search: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await getClients(search);
            setClients(data);
        } catch (err) {
            setError(`No se pudieron cargar los clientes: ${getErrorMessage(err)}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients(debouncedSearchTerm);
    }, [fetchClients, debouncedSearchTerm]);

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
        fetchClients(debouncedSearchTerm);
    };

    const handleDeleteRequest = (client: Client) => {
        setClientToDelete(client);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!clientToDelete) return;
        try {
            await deleteClient(clientToDelete.id);
            fetchClients(debouncedSearchTerm);
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

    return (
        <>
            <div className="mb-4">
                 <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-secondary p-2 pl-10 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Buscar clientes"
                    />
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-text-secondary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </div>
                </div>
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
                                    <th className="p-4">Nombre</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Teléfono</th>
                                    <th className="p-4">Fecha de Alta</th>
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
                    )}
                    {!loading && clients.length === 0 && (
                         <p className="text-center p-8 text-text-secondary">
                            {debouncedSearchTerm
                                ? `No se encontraron clientes para "${debouncedSearchTerm}".`
                                : 'No se encontraron clientes. Los leads ganados aparecerán aquí.'
                            }
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
import React, { useState, useEffect, useCallback } from 'react';
import { getClients, getErrorMessage } from '../services/api';
import { Client } from '../types';
import Spinner from './Spinner';
import ClientModal from './ClientModal';

const ClientsList: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchClients = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getClients();
            setClients(data);
        } catch (err) {
            setError(`No se pudieron cargar los clientes: ${getErrorMessage(err)}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

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
        fetchClients();
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
                                    <td className="p-4">
                                        <button onClick={() => handleOpenModal(client)} className="text-accent hover:underline">Editar</button>
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
        </>
    );
};

export default ClientsList;
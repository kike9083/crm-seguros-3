import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getLeads, deleteLead, getErrorMessage, getAllProfiles } from '../services/api';
import { Lead, Profile } from '../types';
import Spinner from './Spinner';
import LeadModal from './LeadModal';
import ConfirmationModal from './ConfirmationModal';
import PlusIcon from './icons/PlusIcon';
import { useAuth } from './auth/AuthContext';
import { STATUS_COLORS } from '../constants';

const LeadsList: React.FC = () => {
    const { profile } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
    
    // Estado para la búsqueda
    const [searchTerm, setSearchTerm] = useState('');

    const agentMap = React.useMemo(() => {
        const map = new Map<string, string>();
        profiles.forEach(p => map.set(p.id, p.nombre));
        return map;
    }, [profiles]);

    const fetchLeadsAndProfiles = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [leadsData, profilesData] = await Promise.all([
                getLeads(),
                getAllProfiles()
            ]);
            setLeads(leadsData);
            setProfiles(profilesData);
        } catch (err) {
            setError(`No se pudieron cargar los leads o perfiles: ${getErrorMessage(err)}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeadsAndProfiles();
    }, [fetchLeadsAndProfiles]);

    // Lógica de filtrado con protección contra nulos
    const filteredLeads = useMemo(() => {
        if (!searchTerm) return leads;
        
        const lowerTerm = searchTerm.toLowerCase();
        
        return leads.filter(lead => {
            const agentName = lead.agent_id ? agentMap.get(lead.agent_id)?.toLowerCase() : '';
            
            return (
                (lead.nombre?.toLowerCase() || '').includes(lowerTerm) ||
                (lead.email?.toLowerCase() || '').includes(lowerTerm) ||
                (lead.telefono?.toLowerCase() || '').includes(lowerTerm) ||
                (agentName && agentName.includes(lowerTerm)) ||
                (lead.estatus_lead?.toLowerCase() || '').includes(lowerTerm)
            );
        });
    }, [leads, searchTerm, agentMap]);

    const handleOpenModal = (lead: Lead | null) => {
        setSelectedLead(lead);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedLead(null);
    };

    const handleSave = () => {
        handleCloseModal();
        fetchLeadsAndProfiles();
    };

    const handleDeleteRequest = (lead: Lead) => {
        setLeadToDelete(lead);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!leadToDelete) return;
        try {
            await deleteLead(leadToDelete.id);
            fetchLeadsAndProfiles();
        } catch (err) {
            alert(`No se pudo eliminar el lead: ${getErrorMessage(err)}`);
        } finally {
            setIsConfirmModalOpen(false);
            setLeadToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setIsConfirmModalOpen(false);
        setLeadToDelete(null);
    };


    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <div className="relative w-full max-w-sm">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email, agente o estatus..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-secondary p-2 pl-10 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary text-text-primary placeholder-text-secondary"
                        aria-label="Buscar leads"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-text-secondary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="flex items-center bg-primary hover:bg-accent text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <PlusIcon className="w-5 h-5 mr-2"/>
                    Nuevo Lead
                </button>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-border">
                            <tr>
                                <th className="p-4">Nombre</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Teléfono</th>
                                <th className="p-4">Fuente</th>
                                <th className="p-4">Estatus</th>
                                <th className="p-4">Agente</th>
                                <th className="p-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.map(lead => (
                                <tr key={lead.id} className="border-b border-border hover:bg-secondary">
                                    <td className="p-4 font-medium">{lead.nombre}</td>
                                    <td className="p-4 text-text-secondary">{lead.email}</td>
                                    <td className="p-4 text-text-secondary">{lead.telefono}</td>
                                    <td className="p-4 text-text-secondary">{lead.fuente}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full text-white ${STATUS_COLORS[lead.estatus_lead] || 'bg-gray-500'}`}>
                                            {lead.estatus_lead}
                                        </span>
                                    </td>
                                    <td className="p-4 text-blue-300">{lead.agent_id ? agentMap.get(lead.agent_id) : 'N/A'}</td>
                                    <td className="p-4 space-x-2 whitespace-nowrap">
                                        <button onClick={() => handleOpenModal(lead)} className="text-accent hover:underline">Editar</button>
                                        {profile?.rol === 'ADMIN' && (
                                            <button onClick={() => handleDeleteRequest(lead)} className="text-red-500 hover:underline">Eliminar</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredLeads.length === 0 && (
                        <p className="text-center p-8 text-text-secondary">
                            {searchTerm 
                                ? `No se encontraron leads para "${searchTerm}".` 
                                : 'No se encontraron leads.'}
                        </p>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <LeadModal
                    lead={selectedLead}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                title="Confirmar Eliminación de Lead"
                message={`¿Estás seguro de que quieres eliminar a "${leadToDelete?.nombre}"? Esta acción no se puede deshacer.`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Eliminar"
            />
        </>
    );
};

export default LeadsList;
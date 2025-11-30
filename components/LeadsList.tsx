import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getLeads, deleteLead, getErrorMessage, getAllProfiles } from '../services/api';
import { Lead, Profile } from '../types';
import Spinner from './Spinner';
import LeadModal from './LeadModal';
import ConfirmationModal from './ConfirmationModal';
import ImportModal from './ImportModal'; 
import PlusIcon from './icons/PlusIcon';
import WhatsAppIcon from './icons/WhatsAppIcon';
import CloudArrowUpIcon from './icons/CloudArrowUpIcon'; 
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
    const [isImportModalOpen, setIsImportModalOpen] = useState(false); 
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
    
    const isAdmin = profile?.rol === 'ADMIN';

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

    // Lógica de filtrado avanzada
    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            // 1. Filtro de texto (Búsqueda general)
            const lowerTerm = searchTerm.toLowerCase();
            const agentName = lead.agent_id ? agentMap.get(lead.agent_id)?.toLowerCase() : '';
            const matchesSearch = !searchTerm || (
                (lead.nombre?.toLowerCase() || '').includes(lowerTerm) ||
                (lead.email?.toLowerCase() || '').includes(lowerTerm) ||
                (lead.telefono1?.toLowerCase() || '').includes(lowerTerm) ||
                (lead.telefono2?.toLowerCase() || '').includes(lowerTerm) ||
                (agentName && agentName.includes(lowerTerm)) ||
                (lead.estatus_lead?.toLowerCase() || '').includes(lowerTerm)
            );

            // 2. Filtro por Agente
            // Si selectedAgentId está vacío, mostramos todo. Si tiene valor, debe coincidir.
            const matchesAgent = !selectedAgentId || lead.agent_id === selectedAgentId;

            // 3. Filtro por Fecha de Creación
            let matchesDate = true;
            if (dateFrom || dateTo) {
                const leadDate = new Date(lead.created_at).setHours(0,0,0,0);
                const from = dateFrom ? new Date(dateFrom).setHours(0,0,0,0) : null;
                const to = dateTo ? new Date(dateTo).setHours(0,0,0,0) : null;

                if (from && leadDate < from) matchesDate = false;
                if (to && leadDate > to) matchesDate = false;
            }

            return matchesSearch && matchesAgent && matchesDate;
        });
    }, [leads, searchTerm, selectedAgentId, dateFrom, dateTo, agentMap]);

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-col gap-4 w-full md:w-auto flex-grow">
                    {/* Barra de búsqueda principal */}
                    <div className="relative w-full md:max-w-md">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email, estatus..."
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

                    {/* Filtros avanzados */}
                    <div className="flex flex-wrap gap-2 items-center">
                        {/* Selector de Agente (Visible para todos, útil para admins o ver compañeros si permitido) */}
                        <select
                            value={selectedAgentId}
                            onChange={(e) => setSelectedAgentId(e.target.value)}
                            className="bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        >
                            <option value="">Todos los Agentes</option>
                            {profiles
                                .filter(p => p.rol === 'AGENTE' || p.rol === 'ADMIN') // Mostrar también admins si tienen leads
                                .map(agent => (
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

                <div className="flex space-x-2">
                    {/* Botón importar visible para todos */}
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center bg-secondary hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap border border-border"
                    >
                        <CloudArrowUpIcon className="w-5 h-5 mr-2"/>
                        Importar Leads
                    </button>
                    <button
                        onClick={() => handleOpenModal(null)}
                        className="flex items-center bg-primary hover:bg-accent text-white font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
                    >
                        <PlusIcon className="w-5 h-5 mr-2"/>
                        Nuevo Lead
                    </button>
                </div>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-border">
                            <tr>
                                <th className="p-4">Nombre</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Teléfono 1</th> 
                                <th className="p-4">WhatsApp</th>
                                <th className="p-4">Fuente</th>
                                <th className="p-4">Fecha Creación</th>
                                <th className="p-4">Estatus</th>
                                <th className="p-4">Agente</th>
                                <th className="p-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.map(lead => {
                                const rawPhone = lead.telefono1 ? lead.telefono1.replace(/\D/g, '') : '';
                                
                                return (
                                <tr key={lead.id} className="border-b border-border hover:bg-secondary">
                                    <td className="p-4 font-medium">{lead.nombre}</td>
                                    <td className="p-4 text-text-secondary">{lead.email}</td>
                                    <td className="p-4 text-text-secondary">
                                        {lead.telefono1 ? (
                                            <a 
                                                href={`tel:${lead.telefono1}`} 
                                                className="hover:text-white hover:underline transition-colors"
                                                title="Llamar"
                                            >
                                                {lead.telefono1}
                                            </a>
                                        ) : ''}
                                    </td>
                                    <td className="p-4">
                                        {rawPhone ? (
                                            <a 
                                                href={`https://wa.me/${rawPhone}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-green-500 hover:text-green-400 inline-block"
                                                title={`Enviar WhatsApp a ${lead.telefono1}`}
                                            >
                                                <WhatsAppIcon className="w-6 h-6" />
                                            </a>
                                        ) : (
                                            <span className="text-text-secondary text-xs opacity-50">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-text-secondary">{lead.fuente}</td>
                                    <td className="p-4 text-text-secondary text-sm">{new Date(lead.created_at).toLocaleDateString()}</td>
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
                            )})}
                        </tbody>
                    </table>
                    {filteredLeads.length === 0 && (
                        <p className="text-center p-8 text-text-secondary">
                            {searchTerm || selectedAgentId || dateFrom || dateTo
                                ? `No se encontraron leads con los filtros seleccionados.` 
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
            {isImportModalOpen && (
                <ImportModal
                    onClose={() => setIsImportModalOpen(false)}
                    onSuccess={handleSave}
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
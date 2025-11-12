
import React, { useState, useEffect, useCallback } from 'react';
import { getLeads } from '../services/api';
import { Lead, LeadStatus } from '../types';
import { LEAD_STATUSES, STATUS_COLORS } from '../constants';
import Spinner from './Spinner';
import LeadModal from './LeadModal';
import PlusIcon from './icons/PlusIcon';

const LeadCard: React.FC<{ lead: Lead; onClick: () => void }> = ({ lead, onClick }) => (
    <div
        onClick={onClick}
        className="bg-secondary p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-600 transition-colors"
    >
        <h3 className="font-bold text-text-primary">{lead.nombre}</h3>
        <p className="text-sm text-text-secondary">{lead.email}</p>
        <p className="text-sm text-text-secondary mt-1">{lead.telefono}</p>
        <div className="mt-2 text-xs text-text-secondary">Fuente: {lead.fuente}</div>
    </div>
);

const PipelineColumn: React.FC<{
    status: LeadStatus;
    leads: Lead[];
    onCardClick: (lead: Lead) => void;
}> = ({ status, leads, onCardClick }) => {
    const statusColor = STATUS_COLORS[status] || 'bg-gray-500';

    return (
        <div className="bg-card w-72 md:w-80 flex-shrink-0 rounded-lg shadow-lg">
            <div className={`p-3 rounded-t-lg flex justify-between items-center ${statusColor}`}>
                <h2 className="font-bold text-white capitalize">{status}</h2>
                <span className="text-sm font-semibold text-white bg-black bg-opacity-20 px-2 py-1 rounded-full">{leads.length}</span>
            </div>
            <div className="p-3 space-y-3 overflow-y-auto h-[calc(100vh-18rem)]">
                {leads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onClick={() => onCardClick(lead)} />
                ))}
            </div>
        </div>
    );
};

const PipelineBoard: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchLeads = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getLeads();
            setLeads(data);
        } catch (err) {
            setError('No se pudieron cargar los leads.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

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
        fetchLeads(); // Refresh data after save
    };
    
    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => handleOpenModal(null)}
                    className="flex items-center bg-primary hover:bg-accent text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <PlusIcon className="w-5 h-5 mr-2"/>
                    Nuevo Lead
                </button>
            </div>
            <div className="flex-1 flex space-x-4 overflow-x-auto pb-4">
                {LEAD_STATUSES.map(status => (
                    <PipelineColumn
                        key={status}
                        status={status}
                        leads={leads.filter(lead => lead.estatus_lead === status)}
                        onCardClick={handleOpenModal}
                    />
                ))}
            </div>
            {isModalOpen && (
                <LeadModal
                    lead={selectedLead}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default PipelineBoard;

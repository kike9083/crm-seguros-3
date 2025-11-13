import React, { useState, useEffect, useCallback } from 'react';
import { getLeads, updateLead, promoteLeadToClient, getErrorMessage } from '../services/api';
import { Lead, LeadStatus } from '../types';
import { LEAD_STATUSES, STATUS_COLORS } from '../constants';
import Spinner from './Spinner';
import LeadModal from './LeadModal';
import PlusIcon from './icons/PlusIcon';

const LeadCard: React.FC<{ 
    lead: Lead; 
    onClick: () => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, leadId: number) => void;
    isDragging: boolean;
}> = ({ lead, onClick, onDragStart, isDragging }) => (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, lead.id)}
        onClick={onClick}
        className={`bg-secondary p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-600 transition-all duration-200 ${isDragging ? 'opacity-50 scale-105' : 'opacity-100'}`}
        aria-grabbed={isDragging}
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
    onDrop: (e: React.DragEvent<HTMLDivElement>, status: LeadStatus) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, leadId: number) => void;
    draggedLeadId: number | null;
}> = ({ status, leads, onCardClick, onDrop, onDragStart, draggedLeadId }) => {
    const [isDraggedOver, setIsDraggedOver] = useState(false);
    const statusColor = STATUS_COLORS[status] || 'bg-gray-500';

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Necesario para permitir el drop
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggedOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        setIsDraggedOver(false);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggedOver(false);
        onDrop(e, status);
    };

    return (
        <div 
            className={`bg-card w-72 md:w-80 flex-shrink-0 rounded-lg shadow-lg transition-colors duration-300 ${isDraggedOver ? 'bg-gray-700' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            aria-dropeffect="move"
        >
            <div className={`p-3 rounded-t-lg flex justify-between items-center ${statusColor}`}>
                <h2 className="font-bold text-white capitalize">{status}</h2>
                <span className="text-sm font-semibold text-white bg-black bg-opacity-20 px-2 py-1 rounded-full">{leads.length}</span>
            </div>
            <div className="p-3 space-y-3 overflow-y-auto h-[calc(100vh-18rem)]">
                {leads.map(lead => (
                    <LeadCard 
                        key={lead.id} 
                        lead={lead} 
                        onClick={() => onCardClick(lead)}
                        onDragStart={onDragStart}
                        isDragging={draggedLeadId === lead.id}
                    />
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
    const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);


    const fetchLeads = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getLeads();
            setLeads(data);
        } catch (err) {
            setError(`No se pudieron cargar los leads: ${getErrorMessage(err)}`);
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
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, leadId: number) => {
        e.dataTransfer.setData('leadId', leadId.toString());
        e.dataTransfer.effectAllowed = "move";
        setDraggedLeadId(leadId);
    };
    
    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, newStatus: LeadStatus) => {
        const leadIdStr = e.dataTransfer.getData('leadId');
        if (!leadIdStr) return;
        const leadId = parseInt(leadIdStr, 10);
        setDraggedLeadId(null);
        
        const leadToMove = leads.find(l => l.id === leadId);
        if (!leadToMove || leadToMove.estatus_lead === newStatus) {
            return; // No hay cambios o el lead no se encontró
        }

        // Actualización optimista de la UI
        const originalLeads = [...leads];
        const updatedLeads = leads.map(l => 
            l.id === leadId ? { ...l, estatus_lead: newStatus } : l
        );
        setLeads(updatedLeads);

        try {
            // Llamada a la API para persistir el cambio
            const updatedLeadData = { ...leadToMove, estatus_lead: newStatus };
            await updateLead(leadId, updatedLeadData);
            
            // Si el nuevo estado es "GANADO", promover a cliente
            if (newStatus === 'GANADO') {
                await promoteLeadToClient(leadId);
            }
        } catch (err) {
            // Revertir la UI en caso de error
            setLeads(originalLeads);
            setError(`Error al actualizar el lead: ${getErrorMessage(err)}`);
            console.error(err);
             // Opcional: mostrar una notificación al usuario
            alert(`No se pudo mover el lead. Error: ${getErrorMessage(err)}`);
        }
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
                        onDrop={handleDrop}
                        onDragStart={handleDragStart}
                        draggedLeadId={draggedLeadId}
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


import React, { useState, useEffect } from 'react';
import { createLead, updateLead, promoteLeadToClient } from '../services/api';
import { Lead, LeadStatus } from '../types';
import { LEAD_STATUSES } from '../constants';

interface LeadModalProps {
    lead: Lead | null;
    onClose: () => void;
    onSave: () => void;
}

const LeadModal: React.FC<LeadModalProps> = ({ lead, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        fuente: 'Web',
        estatus_lead: 'NUEVO' as LeadStatus,
        notas: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (lead) {
            setFormData({
                nombre: lead.nombre,
                email: lead.email,
                telefono: lead.telefono,
                fuente: lead.fuente,
                estatus_lead: lead.estatus_lead,
                notas: lead.notas || '',
            });
        }
    }, [lead]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            if (lead) {
                const updatedLead = await updateLead(lead.id, formData);
                if (updatedLead.estatus_lead === 'GANADO') {
                    await promoteLeadToClient(lead.id);
                }
            } else {
                const newLead = await createLead(formData);
                 if (newLead.estatus_lead === 'GANADO' && newLead.id) {
                    await promoteLeadToClient(newLead.id);
                }
            }
            onSave();
        } catch (err) {
            setError('Error al guardar el lead. Inténtelo de nuevo.');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-card rounded-lg shadow-2xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">{lead ? 'Editar Lead' : 'Nuevo Lead'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-text-secondary mb-1">Nombre Completo</label>
                            <input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" required />
                        </div>
                        <div>
                             <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                            <input id="email" name="email" value={formData.email} onChange={handleChange} type="email" className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" required />
                        </div>
                        <div>
                            <label htmlFor="telefono" className="block text-sm font-medium text-text-secondary mb-1">Teléfono</label>
                            <input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                            <label htmlFor="fuente" className="block text-sm font-medium text-text-secondary mb-1">Fuente</label>
                            <select id="fuente" name="fuente" value={formData.fuente} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                                <option>Web</option>
                                <option>Referido</option>
                                <option>Llamada en frío</option>
                                <option>Evento</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="estatus_lead" className="block text-sm font-medium text-text-secondary mb-1">Estatus</label>
                        <select id="estatus_lead" name="estatus_lead" value={formData.estatus_lead} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                            {LEAD_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                    </div>
                    <div>
                       <label htmlFor="notas" className="block text-sm font-medium text-text-secondary mb-1">Notas</label>
                       <textarea id="notas" name="notas" value={formData.notas} onChange={handleChange} rows={3} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                    </div>
                    {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="bg-secondary hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors" disabled={isSaving}>Cancelar</button>
                        <button type="submit" className="bg-primary hover:bg-accent text-white font-bold py-2 px-4 rounded transition-colors" disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeadModal;
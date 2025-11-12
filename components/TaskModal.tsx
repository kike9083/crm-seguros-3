
import React, { useState, useEffect } from 'react';
import { createTask, updateTask, getLeads, getClients } from '../services/api';
import { Task, TaskStatus, Lead, Client } from '../types';
import { TASK_STATUSES } from '../constants';

interface TaskModalProps {
    task: Task | null;
    onClose: () => void;
    onSave: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        descripcion: '',
        tipo: 'LLAMADA' as 'LLAMADA' | 'EMAIL' | 'CITA' | 'WHATSAPP',
        fecha_vencimiento: new Date().toISOString().split('T')[0],
        prioridad: 'MEDIA' as 'ALTA' | 'MEDIA' | 'BAJA',
        estatus: 'PENDIENTE' as TaskStatus,
        lead_id: undefined as number | undefined,
        client_id: undefined as number | undefined,
    });
    const [leads, setLeads] = useState<Lead[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [leadsData, clientsData] = await Promise.all([getLeads(), getClients()]);
                setLeads(leadsData);
                setClients(clientsData);
            } catch (err) {
                console.error("Failed to fetch leads and clients", err);
                setError("No se pudieron cargar los contactos para asociar la tarea.");
            }
        };
        fetchData();

        if (task) {
            setFormData({
                descripcion: task.descripcion,
                tipo: task.tipo,
                fecha_vencimiento: task.fecha_vencimiento.split('T')[0],
                prioridad: task.prioridad,
                estatus: task.estatus,
                lead_id: task.lead_id,
                client_id: task.client_id,
            });
        }
    }, [task]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContactChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        if(value.startsWith('lead-')) {
            setFormData(prev => ({ ...prev, lead_id: parseInt(value.replace('lead-', '')), client_id: undefined }));
        } else if (value.startsWith('client-')) {
            setFormData(prev => ({ ...prev, client_id: parseInt(value.replace('client-', '')), lead_id: undefined }));
        } else {
             setFormData(prev => ({ ...prev, client_id: undefined, lead_id: undefined }));
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.lead_id && !formData.client_id) {
            setError("Debe seleccionar un Lead o Cliente.");
            return;
        }

        setIsSaving(true);
        setError(null);
        
        try {
            if (task) {
                await updateTask(task.id, formData);
            } else {
                await createTask(formData);
            }
            onSave();
        } catch (err) {
            setError('Error al guardar la tarea. Inténtelo de nuevo.');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-card rounded-lg shadow-2xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">{task ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="descripcion" className="block text-sm font-medium text-text-secondary mb-1">Descripción</label>
                        <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} rows={3} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" required></textarea>
                    </div>
                    
                    <div>
                        <label htmlFor="contacto" className="block text-sm font-medium text-text-secondary mb-1">Asociar con</label>
                        <select
                            id="contacto"
                            value={formData.lead_id ? `lead-${formData.lead_id}` : formData.client_id ? `client-${formData.client_id}` : ''}
                            onChange={handleContactChange}
                            className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Seleccione un Lead o Cliente...</option>
                            <optgroup label="Leads">
                                {leads.map(l => <option key={`lead-${l.id}`} value={`lead-${l.id}`}>{l.nombre}</option>)}
                            </optgroup>
                            <optgroup label="Clientes">
                                {clients.map(c => <option key={`client-${c.id}`} value={`client-${c.id}`}>{c.nombre}</option>)}
                            </optgroup>
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fecha_vencimiento" className="block text-sm font-medium text-text-secondary mb-1">Fecha de Vencimiento</label>
                            <input id="fecha_vencimiento" type="date" name="fecha_vencimiento" value={formData.fecha_vencimiento} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" required/>
                        </div>
                        <div>
                            <label htmlFor="tipo" className="block text-sm font-medium text-text-secondary mb-1">Tipo de Contacto</label>
                            <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                                <option>LLAMADA</option>
                                <option>EMAIL</option>
                                <option>CITA</option>
                                <option>WHATSAPP</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="prioridad" className="block text-sm font-medium text-text-secondary mb-1">Prioridad</label>
                            <select id="prioridad" name="prioridad" value={formData.prioridad} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="BAJA">Baja</option>
                                <option value="MEDIA">Media</option>
                                <option value="ALTA">Alta</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="estatus" className="block text-sm font-medium text-text-secondary mb-1">Estatus</label>
                            <select id="estatus" name="estatus" value={formData.estatus} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                                {TASK_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </div>
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

export default TaskModal;
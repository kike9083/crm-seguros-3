
import React, { useState, useEffect } from 'react';
import { createPolicy, updatePolicy, getClients, getProducts } from '../services/api';
import { Client, Product, Policy, PolicyStatus } from '../types';

interface PolicyModalProps {
    policy: Policy | null;
    onClose: () => void;
    onSave: () => void;
}

const PolicyModal: React.FC<PolicyModalProps> = ({ policy, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        client_id: '',
        product_id: '',
        prima_total: 0,
        fecha_emision: new Date().toISOString().split('T')[0],
        fecha_vencimiento: '',
        estatus_poliza: 'ACTIVA' as PolicyStatus,
    });
    const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsData, productsData] = await Promise.all([getClients(), getProducts()]);
                setClients(clientsData);
                setProducts(productsData.filter(p => p.activo || p.id === policy?.product_id)); // Allow active products or the one already selected
            } catch (err) {
                console.error("Failed to fetch clients and products", err);
                setError("No se pudieron cargar los clientes y productos.");
            }
        };
        fetchData();

        if (policy) {
            setFormData({
                client_id: String(policy.client_id),
                product_id: String(policy.product_id),
                prima_total: policy.prima_total,
                fecha_emision: policy.fecha_emision.split('T')[0],
                fecha_vencimiento: policy.fecha_vencimiento.split('T')[0],
                estatus_poliza: policy.estatus_poliza,
            });
        }

    }, [policy]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'fecha_emision' && !policy) { // Only auto-update expiration for new policies
            const startDate = new Date(value);
            startDate.setFullYear(startDate.getFullYear() + 1);
            setFormData(prev => ({ ...prev, fecha_vencimiento: startDate.toISOString().split('T')[0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.client_id || !formData.product_id) {
            setError("Debe seleccionar un cliente y un producto.");
            return;
        }
        setIsSaving(true);
        setError(null);
        
        const dataToSave = {
            ...formData,
            client_id: parseInt(formData.client_id),
            product_id: parseInt(formData.product_id),
            prima_total: parseFloat(String(formData.prima_total)),
        };

        try {
            if (policy) {
                await updatePolicy(policy.id, dataToSave);
            } else {
                await createPolicy(dataToSave);
            }
            onSave();
        } catch (err) {
            setError('Error al guardar la póliza. Inténtelo de nuevo.');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-card rounded-lg shadow-2xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">{policy ? 'Editar Póliza' : 'Crear Nueva Póliza'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="client_id" className="block text-sm font-medium text-text-secondary mb-1">Cliente</label>
                        <select id="client_id" name="client_id" value={formData.client_id} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" required>
                            <option value="">Seleccione un Cliente</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="product_id" className="block text-sm font-medium text-text-secondary mb-1">Producto</label>
                        <select id="product_id" name="product_id" value={formData.product_id} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" required>
                            <option value="">Seleccione un Producto</option>
                             {products.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="prima_total" className="block text-sm font-medium text-text-secondary mb-1">Prima Total Anual ($)</label>
                        <input id="prima_total" type="number" step="0.01" name="prima_total" value={formData.prima_total} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" required/>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="fecha_emision" className="block text-sm font-medium text-text-secondary mb-1">Fecha de Emisión</label>
                            <input id="fecha_emision" type="date" name="fecha_emision" value={formData.fecha_emision} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" required/>
                        </div>
                        <div>
                            <label htmlFor="fecha_vencimiento" className="block text-sm font-medium text-text-secondary mb-1">Fecha de Vencimiento</label>
                            <input id="fecha_vencimiento" type="date" name="fecha_vencimiento" value={formData.fecha_vencimiento} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" required/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="estatus_poliza" className="block text-sm font-medium text-text-secondary mb-1">Estatus de la Póliza</label>
                        <select id="estatus_poliza" name="estatus_poliza" value={formData.estatus_poliza} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="ACTIVA">Activa</option>
                            <option value="PENDIENTE PAGO">Pendiente Pago</option>
                            <option value="CANCELADA">Cancelada</option>
                             <option value="VENCIDA">Vencida</option>
                        </select>
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

export default PolicyModal;
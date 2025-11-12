
import React, { useState, useEffect } from 'react';
import { createProduct, updateProduct } from '../services/api';
import { Product } from '../types';

interface ProductModalProps {
    product: Product | null;
    onClose: () => void;
    onSave: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        aseguradora: '',
        categoria: 'General',
        comision_porcentaje: 0,
        precio_base: 0,
        activo: true,
        descripcion: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (product) {
            setFormData({
                nombre: product.nombre || '',
                aseguradora: product.aseguradora || '',
                categoria: product.categoria || 'General',
                comision_porcentaje: product.comision_porcentaje || 0,
                precio_base: product.precio_base || 0,
                activo: product.activo,
                descripcion: product.descripcion || ''
            });
        }
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        const dataToSave = {
            ...formData,
            comision_porcentaje: parseFloat(String(formData.comision_porcentaje)),
            precio_base: parseFloat(String(formData.precio_base))
        }

        try {
            if (product) {
                await updateProduct(product.id, dataToSave);
            } else {
                await createProduct(dataToSave);
            }
            onSave();
        } catch (err) {
            setError('Error al guardar el producto. Inténtelo de nuevo.');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-card rounded-lg shadow-2xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-text-secondary mb-1">Nombre del Producto</label>
                        <input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label htmlFor="aseguradora" className="block text-sm font-medium text-text-secondary mb-1">Aseguradora</label>
                           <input id="aseguradora" name="aseguradora" value={formData.aseguradora} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" required />
                        </div>
                        <div>
                            <label htmlFor="categoria" className="block text-sm font-medium text-text-secondary mb-1">Categoría</label>
                             <input id="categoria" name="categoria" value={formData.categoria} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <label htmlFor="precio_base" className="block text-sm font-medium text-text-secondary mb-1">Precio Base ($)</label>
                             <input id="precio_base" type="number" step="0.01" name="precio_base" value={formData.precio_base} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" required/>
                         </div>
                          <div>
                             <label htmlFor="comision_porcentaje" className="block text-sm font-medium text-text-secondary mb-1">% Comisión</label>
                            <input id="comision_porcentaje" type="number" step="0.01" name="comision_porcentaje" value={formData.comision_porcentaje} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" required/>
                         </div>
                    </div>
                    <div>
                        <label htmlFor="descripcion" className="block text-sm font-medium text-text-secondary mb-1">Descripción</label>
                        <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} rows={3} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" id="activo" name="activo" checked={formData.activo} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <label htmlFor="activo" className="ml-2 block text-sm text-text-primary">Producto Activo</label>
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

export default ProductModal;
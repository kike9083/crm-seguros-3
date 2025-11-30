import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPolicy, updatePolicy, getClients, getProducts, getFiles, uploadFile, getPublicUrl, getErrorMessage, getAllProfiles, sanitizeFileName, downloadFile } from '../services/api';
import { Client, Product, Policy, PolicyStatus, FileObject, Profile, ProductDetail } from '../types';
import { useAuth } from './auth/AuthContext';
import Spinner from './Spinner';
import PlusIcon from './icons/PlusIcon';

interface PolicyModalProps {
    policy: Policy | null;
    onClose: () => void;
    onSave: () => void;
}

const PolicyModal: React.FC<PolicyModalProps> = ({ policy, onClose, onSave }) => {
    const { user, profile } = useAuth();
    const isAdmin = profile?.rol === 'ADMIN';
    const [agents, setAgents] = useState<Profile[]>([]);

    const [formData, setFormData] = useState({
        client_id: '',
        fecha_emision: new Date().toISOString().split('T')[0],
        fecha_vencimiento: '',
        estatus_poliza: 'ACTIVA' as PolicyStatus,
        agent_id: user?.id || ''
    });

    // Estado para gestión de productos
    const [selectedProducts, setSelectedProducts] = useState<ProductDetail[]>([]);
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    
    // Estado temporal para agregar un nuevo producto
    const [newProduct, setNewProduct] = useState({
        id: '',
        prima_mensual: '' as string | number,
        suma_asegurada: '' as string | number
    });

    const [clients, setClients] = useState<Client[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [files, setFiles] = useState<FileObject[]>([]);
    const [isFilesLoading, setIsFilesLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchFiles = useCallback(async () => {
        if (!policy) return;
        setIsFilesLoading(true);
        setFileError(null);
        try {
            const fileList = await getFiles('policy_files', String(policy.id));
            setFiles(fileList);
        } catch (err) {
            console.error('Error fetching files:', err);
            setFileError(`No se pudieron cargar los archivos.`);
        } finally {
            setIsFilesLoading(false);
        }
    }, [policy]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsData, productsData, allProfiles] = await Promise.all([getClients(), getProducts(), getAllProfiles()]);
                setClients(clientsData);
                setAvailableProducts(productsData.filter(p => p.activo));
                setAgents(allProfiles.filter(p => p.rol === 'AGENTE'));
            } catch (err) {
                console.error("Failed to fetch lists", err);
                setError(`No se pudieron cargar listas: ${getErrorMessage(err)}`);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (policy) {
            setFormData({
                client_id: String(policy.client_id),
                fecha_emision: policy.fecha_emision ? policy.fecha_emision.split('T')[0] : '',
                fecha_vencimiento: policy.fecha_vencimiento ? policy.fecha_vencimiento.split('T')[0] : '',
                estatus_poliza: policy.estatus_poliza,
                agent_id: policy.agent_id || (isAdmin ? '' : (user?.id || ''))
            });

            // LÓGICA DE RECUPERACIÓN DE PRODUCTOS
            // 1. Intentar cargar desde el campo JSON 'productos_detalle' (Formato nuevo)
            if (policy.productos_detalle && Array.isArray(policy.productos_detalle) && policy.productos_detalle.length > 0) {
                setSelectedProducts(policy.productos_detalle);
            } 
            // 2. Fallback: Si no hay detalle JSON (póliza antigua), reconstruir desde 'product_id'
            else if (policy.product_id) {
                // Buscamos el producto base en la lista de disponibles (aunque esté inactivo, deberíamos poder verlo, 
                // pero aquí dependemos de availableProducts que filtra activos. 
                // Idealmente deberíamos buscar en todos los productos).
                // Nota: availableProducts se carga asíncronamente, esto podría fallar si se ejecuta antes de fetchData.
                // Sin embargo, como es solo visualización inicial, intentaremos mapearlo lo mejor posible.
                
                // Si availableProducts aún no cargó, no podremos mapear el nombre aquí mismo.
                // Pero podemos crear un objeto temporal con lo que tenemos en la póliza.
                
                // Intentamos usar la relación 'products' si vino del backend (join)
                const legacyProduct = Array.isArray(policy.products) ? policy.products[0] : policy.products;
                
                if (legacyProduct) {
                     const recoveredProduct: ProductDetail = {
                        id: policy.product_id,
                        nombre: legacyProduct.nombre || 'Producto (Legacy)',
                        categoria: legacyProduct.categoria || 'General',
                        aseguradora: 'Desconocida', // No siempre disponible en el join simple
                        prima_mensual: Number(policy.prima_total) || 0, // Usamos el total de la póliza como prima
                        suma_asegurada: Number(policy.suma_asegurada_total) || 0,
                        comision_porcentaje: 0, // Dato perdido en legacy
                        comision_generada: Number(policy.comision_agente) || 0
                    };
                    setSelectedProducts([recoveredProduct]);
                }
            } else {
                setSelectedProducts([]);
            }

            fetchFiles();
        } else {
            // Nueva Póliza
            setFormData({
                client_id: '',
                fecha_emision: new Date().toISOString().split('T')[0],
                fecha_vencimiento: '',
                estatus_poliza: 'ACTIVA',
                agent_id: user?.id || ''
            });
            setSelectedProducts([]);
            setFiles([]);
        }
    }, [policy, user, isAdmin, fetchFiles]); // Removido availableProducts de dependencias para evitar loops, la lógica de legacy es best-effort

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'fecha_emision' && !policy) {
            const startDate = new Date(value);
            startDate.setFullYear(startDate.getFullYear() + 1);
            setFormData(prev => ({ ...prev, fecha_vencimiento: startDate.toISOString().split('T')[0] }));
        }

        if (name === 'client_id' && !policy) {
            const selectedClient = clients.find(c => c.id === parseInt(value));
            if (selectedClient?.agent_id && !isAdmin) { 
                setFormData(prev => ({ ...prev, agent_id: selectedClient.agent_id }));
            } else if (isAdmin) {
                setFormData(prev => ({ ...prev, agent_id: selectedClient?.agent_id || '' }));
            } else {
                setFormData(prev => ({ ...prev, agent_id: user?.id || '' }));
            }
        }
    };

    const handleNewProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleAddProduct = () => {
        if (!newProduct.id || !newProduct.prima_mensual || !newProduct.suma_asegurada) {
            return; 
        }

        const prodBase = availableProducts.find(p => p.id === parseInt(newProduct.id));
        if (prodBase) {
            const prima = parseFloat(String(newProduct.prima_mensual));
            const suma = parseFloat(String(newProduct.suma_asegurada));
            
            const newDetail: ProductDetail = {
                id: prodBase.id,
                nombre: prodBase.nombre,
                categoria: prodBase.categoria || 'General',
                aseguradora: prodBase.aseguradora,
                prima_mensual: prima,
                suma_asegurada: suma,
                comision_porcentaje: prodBase.comision_porcentaje,
                comision_generada: (prima * (prodBase.comision_porcentaje / 100)) * 12 // Estimado anual
            };
            setSelectedProducts([...selectedProducts, newDetail]);
            
            setNewProduct({ id: '', prima_mensual: '', suma_asegurada: '' });
        }
    };

    const handleRemoveProduct = (index: number) => {
        const newProducts = [...selectedProducts];
        newProducts.splice(index, 1);
        setSelectedProducts(newProducts);
    };

    const totalPrimaMensual = selectedProducts.reduce((sum, p) => sum + Number(p.prima_mensual), 0);
    const totalSumaAsegurada = selectedProducts.reduce((sum, p) => sum + Number(p.suma_asegurada), 0);
    const totalComisionEstimada = selectedProducts.reduce((sum, p) => sum + ((p.prima_mensual * (p.comision_porcentaje || 0)) / 100), 0); // Mensual

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !policy) return;

        setIsUploading(true);
        setFileError(null);
        try {
            const sanitizedName = sanitizeFileName(file.name);
            const filePath = `${policy.id}/${sanitizedName}`;
            await uploadFile('policy_files', filePath, file);
            await fetchFiles();
        } catch (err) {
            console.error('Error uploading file:', err);
            setFileError(`Error al subir.`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.client_id) {
            setError("Debe seleccionar un cliente.");
            return;
        }
        if (selectedProducts.length === 0) {
            setError("Debe seleccionar y configurar al menos un producto.");
            return;
        }

        setIsSaving(true);
        setError(null);
        
        const dataToSave = {
            client_id: parseInt(formData.client_id),
            product_id: selectedProducts[0].id, 
            
            prima_total: totalPrimaMensual, 
            suma_asegurada_total: totalSumaAsegurada,
            productos_detalle: selectedProducts,
            comision_agente: totalComisionEstimada, 

            fecha_emision: formData.fecha_emision,
            fecha_vencimiento: formData.fecha_vencimiento,
            estatus_poliza: formData.estatus_poliza,
            agent_id: formData.agent_id
        };

        try {
            if (policy) {
                await updatePolicy(policy.id, dataToSave);
            } else {
                await createPolicy(dataToSave);
            }
            onSave();
        } catch (err) {
            setError(`Error al guardar: ${getErrorMessage(err)}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-card rounded-lg shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">{policy ? 'Editar Póliza' : 'Crear Nueva Póliza'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="client_id" className="block text-sm font-medium text-text-secondary mb-1">Cliente</label>
                            <select id="client_id" name="client_id" value={formData.client_id} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" required>
                                <option value="">Seleccione un Cliente</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="estatus_poliza" className="block text-sm font-medium text-text-secondary mb-1">Estatus</label>
                            <select id="estatus_poliza" name="estatus_poliza" value={formData.estatus_poliza} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="ACTIVA">Activa</option>
                                <option value="PENDIENTE PAGO">Pendiente Pago</option>
                                <option value="CANCELADA">Cancelada</option>
                                <option value="VENCIDA">Vencida</option>
                            </select>
                        </div>
                    </div>

                    {/* SECCIÓN DE PRODUCTOS MÚLTIPLES (Configuración Manual) */}
                    <div className="border border-border p-4 rounded-lg bg-secondary bg-opacity-20">
                        <h3 className="text-sm font-bold text-text-primary mb-3">Productos Contratados</h3>
                        
                        {/* Formulario para agregar producto */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-4 items-end">
                            <div className="md:col-span-5">
                                <label className="text-xs text-text-secondary">Producto Base</label>
                                <select 
                                    name="id"
                                    value={newProduct.id} 
                                    onChange={handleNewProductChange} 
                                    className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                >
                                    <option value="">Seleccionar...</option>
                                    {availableProducts.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.aseguradora})</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-xs text-text-secondary">Suma Aseg. ($)</label>
                                <input 
                                    type="number" 
                                    name="suma_asegurada"
                                    value={newProduct.suma_asegurada}
                                    onChange={handleNewProductChange}
                                    placeholder="0.00"
                                    className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                />
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-xs text-text-secondary">Prima Mensual ($)</label>
                                <input 
                                    type="number" 
                                    name="prima_mensual"
                                    value={newProduct.prima_mensual}
                                    onChange={handleNewProductChange}
                                    placeholder="0.00"
                                    className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <button type="button" onClick={handleAddProduct} className="w-full bg-primary hover:bg-accent text-white p-2 rounded font-bold flex justify-center items-center h-[38px]">
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Tabla de productos seleccionados */}
                        {selectedProducts.length > 0 ? (
                            <table className="w-full text-left text-sm mb-4">
                                <thead className="text-text-secondary border-b border-border">
                                    <tr>
                                        <th className="py-2">Producto</th>
                                        <th className="py-2">Suma Aseg.</th>
                                        <th className="py-2">Prima Mens.</th>
                                        <th className="py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedProducts.map((prod, idx) => (
                                        <tr key={idx} className="border-b border-border border-opacity-50">
                                            <td className="py-2">{prod.nombre}</td>
                                            <td className="py-2">${prod.suma_asegurada.toLocaleString()}</td>
                                            <td className="py-2">${prod.prima_mensual.toLocaleString()}</td>
                                            <td className="py-2 text-right">
                                                <button type="button" onClick={() => handleRemoveProduct(idx)} className="text-red-400 hover:text-red-300">X</button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="font-bold text-text-primary bg-white bg-opacity-5">
                                        <td className="py-2 pl-2">TOTALES</td>
                                        <td className="py-2">${totalSumaAsegurada.toLocaleString()}</td>
                                        <td className="py-2 text-green-400">${totalPrimaMensual.toLocaleString()}</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-sm text-text-secondary text-center italic py-2">Agrega productos configurando su prima y suma asegurada.</p>
                        )}
                        <p className="text-xs text-text-secondary text-right mt-2">Comisión Mensual Estimada: ${totalComisionEstimada.toLocaleString()}</p>
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

                    {isAdmin && (
                        <div>
                            <label htmlFor="agent_id" className="block text-sm font-medium text-text-secondary mb-1">Agente Responsable</label>
                            <select 
                                id="agent_id" 
                                name="agent_id" 
                                value={formData.agent_id} 
                                onChange={handleChange} 
                                className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">(Sin asignar)</option>
                                {agents.map(agent => (
                                    <option key={agent.id} value={agent.id}>{agent.nombre}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}

                    {/* ARCHIVOS (Se mantiene igual) */}
                    {policy && (
                         <div className="mt-6 border-t border-border pt-4">
                            <h3 className="text-lg font-medium text-text-primary mb-3 flex items-center">
                                Archivos de la Póliza
                            </h3>
                            {isFilesLoading ? (
                                <div className="flex justify-center p-4"><Spinner /></div>
                            ) : (
                                <div className="space-y-2">
                                    {files.map(file => (
                                        <div key={file.id} className="flex items-center justify-between bg-secondary p-2 rounded">
                                            <span className="text-sm truncate">{file.name}</span>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await downloadFile('policy_files', `${policy.id}/${file.name}`, file.name);
                                                    } catch (err) {
                                                        alert(`Error: ${getErrorMessage(err)}`);
                                                    }
                                                }}
                                                className="text-accent hover:underline p-1 focus:outline-none"
                                                type="button"
                                            >
                                                Descargar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-4">
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" disabled={isUploading} />
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center text-sm bg-secondary hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-lg transition-colors" disabled={isUploading}>
                                    <PlusIcon className="w-4 h-4 mr-2" /> Añadir Archivo
                                </button>
                            </div>
                        </div>
                    )}

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
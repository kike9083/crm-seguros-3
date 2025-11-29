import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPolicy, updatePolicy, getClients, getProducts, getFiles, uploadFile, getPublicUrl, getErrorMessage, getAllProfiles, sanitizeFileName } from '../services/api';
import { Client, Product, Policy, PolicyStatus, FileObject, Profile } from '../types';
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

    // Allow prima_total to be string during editing to support empty input
    const [formData, setFormData] = useState({
        client_id: '',
        product_id: '',
        prima_total: 0 as string | number,
        fecha_emision: new Date().toISOString().split('T')[0],
        fecha_vencimiento: '',
        estatus_poliza: 'ACTIVA' as PolicyStatus,
        agent_id: user?.id || ''
    });
    const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
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
            setFileError(`No se pudieron cargar los archivos: ${getErrorMessage(err)}`);
        } finally {
            setIsFilesLoading(false);
        }
    }, [policy]);


    // EFECTO 1: Cargar listas desplegables (Clientes, Productos, Agentes)
    // Se ejecuta solo una vez al montar el componente (dependencia vacía [])
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsData, productsData, allProfiles] = await Promise.all([getClients(), getProducts(), getAllProfiles()]);
                setClients(clientsData);
                // Filtramos productos activos O el producto que ya tiene asignada la póliza (por si se archivó)
                setProducts(productsData.filter(p => p.activo || (policy && p.id === policy.product_id)));
                setAgents(allProfiles.filter(p => p.rol === 'AGENTE'));
            } catch (err) {
                console.error("Failed to fetch lists", err);
                setError(`No se pudieron cargar listas: ${getErrorMessage(err)}`);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Dependencias vacías para evitar bucles

    // EFECTO 2: Inicializar formulario con datos de la póliza
    // Se ejecuta cuando cambia la prop 'policy'
    useEffect(() => {
        if (policy) {
            setFormData({
                client_id: String(policy.client_id),
                product_id: String(policy.product_id),
                prima_total: policy.prima_total,
                fecha_emision: policy.fecha_emision.split('T')[0],
                fecha_vencimiento: policy.fecha_vencimiento.split('T')[0],
                estatus_poliza: policy.estatus_poliza,
                agent_id: policy.agent_id || (isAdmin ? '' : (user?.id || ''))
            });
            fetchFiles();
        } else {
             // Para nuevas pólizas, limpiar o establecer defaults
            setFormData({
                client_id: '',
                product_id: '',
                prima_total: 0,
                fecha_emision: new Date().toISOString().split('T')[0],
                fecha_vencimiento: '',
                estatus_poliza: 'ACTIVA',
                agent_id: user?.id || ''
            });
            setFiles([]);
        }
    }, [policy, user, isAdmin, fetchFiles]);

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
            if (selectedClient?.agent_id && !isAdmin) { // Only auto-assign if not admin
                setFormData(prev => ({ ...prev, agent_id: selectedClient.agent_id }));
            } else if (isAdmin) { // Admins can choose or keep it empty
                setFormData(prev => ({ ...prev, agent_id: selectedClient?.agent_id || '' }));
            } else { // Fallback for agents if no client agent_id
                setFormData(prev => ({ ...prev, agent_id: user?.id || '' }));
            }
        }
    };
    
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
            setFileError(`Error al subir el archivo: ${getErrorMessage(err)}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
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
            client_id: parseInt(formData.client_id),
            product_id: parseInt(formData.product_id),
            prima_total: parseFloat(String(formData.prima_total)),
            fecha_emision: formData.fecha_emision,
            fecha_vencimiento: formData.fecha_vencimiento,
            estatus_poliza: formData.estatus_poliza,
            agent_id: formData.agent_id // Pass string, api.ts handles empty string -> null
        };

        try {
            if (policy) {
                await updatePolicy(policy.id, dataToSave);
            } else {
                await createPolicy(dataToSave);
            }
            onSave();
        } catch (err) {
            setError(`Error al guardar la póliza: ${getErrorMessage(err)}`);
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-card rounded-lg shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
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

                    {policy && (
                         <div className="mt-6 border-t border-border pt-4">
                            <h3 className="text-lg font-medium text-text-primary mb-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.122 2.122l7.81-7.81" /></svg>
                                Archivos de la Póliza
                            </h3>
                            {isFilesLoading ? (
                                <div className="flex justify-center p-4"><Spinner /></div>
                            ) : fileError ? (
                                <p className="text-red-500 text-sm">{fileError}</p>
                            ) : (
                                <div className="space-y-2">
                                    {files.length === 0 && !isUploading && (
                                        <p className="text-text-secondary text-sm">No hay archivos adjuntos.</p>
                                    )}
                                    {files.map(file => (
                                        <div key={file.id} className="flex items-center justify-between bg-secondary p-2 rounded">
                                            <span className="text-sm truncate">{file.name}</span>
                                            <a
                                                href={getPublicUrl('policy_files', `${policy.id}/${file.name}`)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                className="text-accent hover:underline p-1"
                                                title="Descargar"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                                            </a>
                                        </div>
                                    ))}
                                    {isUploading && (
                                        <div className="flex items-center text-sm text-text-secondary">
                                            <Spinner />
                                            <span className="ml-2">Subiendo archivo...</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="mt-4">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={isUploading}
                                />
                                <button
                                    type="button"
                                    onClick={handleButtonClick}
                                    disabled={isUploading}
                                    className="flex items-center text-sm bg-secondary hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Añadir Archivo
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
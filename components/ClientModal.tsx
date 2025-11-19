import React, { useState, useEffect, useCallback, useRef } from 'react';
import { updateClient, getFiles, uploadFile, getPublicUrl, getErrorMessage } from '../services/api';
import { Client, FileObject } from '../types';
import Spinner from './Spinner';
import PlusIcon from './icons/PlusIcon';

interface ClientModalProps {
    client: Client;
    onClose: () => void;
    onSave: () => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ client, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [files, setFiles] = useState<FileObject[]>([]);
    const [isFilesLoading, setIsFilesLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchFiles = useCallback(async () => {
        if (!client) return;
        setIsFilesLoading(true);
        setFileError(null);
        try {
            const fileList = await getFiles('client_files', String(client.id));
            setFiles(fileList);
        } catch (err) {
            console.error('Error fetching files:', err);
            setFileError(`No se pudieron cargar los archivos: ${getErrorMessage(err)}`);
        } finally {
            setIsFilesLoading(false);
        }
    }, [client]);

    useEffect(() => {
        if (client) {
            setFormData({
                nombre: client.nombre || '',
                email: client.email || '',
                telefono: client.telefono || '',
                fecha_nacimiento: client.fecha_nacimiento ? client.fecha_nacimiento.split('T')[0] : '',
            });
            fetchFiles();
        }
    }, [client, fetchFiles]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !client) return;

        setIsUploading(true);
        setFileError(null);
        try {
            const filePath = `${client.id}/${file.name}`;
            await uploadFile('client_files', filePath, file);
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
        setIsSaving(true);
        setError(null);
        
        const dataToUpdate = {
            ...formData,
            fecha_nacimiento: formData.fecha_nacimiento || null
        };

        try {
            await updateClient(client.id, dataToUpdate);
            onSave();
        } catch (err) {
            setError(`Error al guardar el cliente: ${getErrorMessage(err)}`);
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-card rounded-lg shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">Editar Cliente</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-text-secondary mb-1">Nombre Completo</label>
                        <input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                            <input id="email" name="email" value={formData.email} onChange={handleChange} type="email" className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" required />
                        </div>
                        <div>
                            <label htmlFor="telefono" className="block text-sm font-medium text-text-secondary mb-1">Teléfono</label>
                            <input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-text-secondary mb-1">Fecha de Nacimiento</label>
                        <input id="fecha_nacimiento" name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>

                    {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}

                    <div className="mt-6 border-t border-border pt-4">
                        <h3 className="text-lg font-medium text-text-primary mb-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.122 2.122l7.81-7.81" /></svg>
                            Archivos del Cliente
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
                                            href={getPublicUrl('client_files', `${client.id}/${file.name}`)}
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


                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="bg-secondary hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors" disabled={isSaving}>Cancelar</button>
                        <button type="submit" className="bg-primary hover:bg-accent text-white font-bold py-2 px-4 rounded transition-colors" disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientModal;
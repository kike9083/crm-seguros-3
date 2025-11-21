import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createProduct, updateProduct, getErrorMessage, uploadFile, getFiles, createSignedUrl, deleteFile } from '../services/api';
import { Product, ProductCategory, FileObject } from '../types';
import { PRODUCT_CATEGORIES } from '../constants';
import Spinner from './Spinner';
import PlusIcon from './icons/PlusIcon';
import ArrowDownTrayIcon from './icons/ArrowDownTrayIcon';
import TrashIcon from './icons/TrashIcon';
import ConfirmationModal from './ConfirmationModal';

interface ProductModalProps {
    product: Product | null;
    onClose: () => void;
    onSave: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        aseguradora: '',
        categoria: 'vida' as ProductCategory,
        comision_porcentaje: 0,
        precio_base: 0,
        activo: true,
        descripcion: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [files, setFiles] = useState<FileObject[]>([]);
    const [isFilesLoading, setIsFilesLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<FileObject | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchFiles = useCallback(async () => {
        if (!product) return;
        setIsFilesLoading(true);
        setFileError(null);
        try {
            const fileList = await getFiles('product_files', String(product.id));
            setFiles(fileList);
        } catch (err) {
            console.error('Error fetching files:', err);
            setFileError(`No se pudieron cargar los archivos: ${getErrorMessage(err)}`);
        } finally {
            setIsFilesLoading(false);
        }
    }, [product]);

    useEffect(() => {
        if (product) {
            setFormData({
                nombre: product.nombre || '',
                aseguradora: product.aseguradora || '',
                categoria: product.categoria || 'vida',
                comision_porcentaje: product.comision_porcentaje || 0,
                precio_base: product.precio_base || 0,
                activo: product.activo,
                descripcion: product.descripcion || ''
            });
            fetchFiles();
        }
    }, [product, fetchFiles]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !product) return;

        setIsUploading(true);
        setFileError(null);
        try {
            const filePath = `${product.id}/${file.name}`;
            await uploadFile('product_files', filePath, file);
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
    
    const handleDownload = async (file: FileObject) => {
        if (!product) return;
        setDownloadingFileId(file.id);
        try {
            const path = `${product.id}/${file.name}`;
            const signedUrl = await createSignedUrl('product_files', path);
            window.open(signedUrl, '_blank');
        } catch (err) {
            alert(`No se pudo generar el enlace de descarga: ${getErrorMessage(err)}`);
        } finally {
            setDownloadingFileId(null);
        }
    };

    const handleDeleteRequest = (file: FileObject) => {
        setFileToDelete(file);
        setIsConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!fileToDelete || !product) return;
        setIsDeleting(true);
        setFileError(null);
        try {
            const path = `${product.id}/${fileToDelete.name}`;
            await deleteFile('product_files', path);
            await fetchFiles();
        } catch (err) {
            setFileError(`Error al eliminar el archivo: ${getErrorMessage(err)}`);
        } finally {
            setIsDeleting(false);
            setIsConfirmDeleteOpen(false);
            setFileToDelete(null);
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
            const message = `Error al guardar el producto: ${getErrorMessage(err)}`;
            setError(message);
            alert(message);
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                <div className="bg-card rounded-lg shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
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
                                 <select 
                                    id="categoria" 
                                    name="categoria" 
                                    value={formData.categoria} 
                                    onChange={handleChange} 
                                    className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                >
                                    {PRODUCT_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                    ))}
                                </select>
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

                        {product && (
                             <div className="mt-6 border-t border-border pt-4">
                                <h3 className="text-lg font-medium text-text-primary mb-3 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.122 2.122l7.81-7.81" /></svg>
                                    Archivos del Producto
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
                                                <span className="text-sm truncate mr-2">{file.name}</span>
                                                <div className="flex items-center space-x-2 flex-shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDownload(file)}
                                                        disabled={downloadingFileId === file.id}
                                                        className="text-accent hover:underline p-1 disabled:opacity-50"
                                                        title="Descargar"
                                                    >
                                                        {downloadingFileId === file.id ? <Spinner/> : <ArrowDownTrayIcon className="w-5 h-5"/>}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteRequest(file)}
                                                        className="text-red-500 hover:text-red-400 p-1"
                                                        title="Eliminar"
                                                    >
                                                        <TrashIcon className="w-5 h-5"/>
                                                    </button>
                                                </div>
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
             <ConfirmationModal
                isOpen={isConfirmDeleteOpen}
                title="Confirmar Eliminación de Archivo"
                message={`¿Estás seguro de que quieres eliminar el archivo "${fileToDelete?.name}"? Esta acción no se puede deshacer.`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsConfirmDeleteOpen(false)}
                confirmText={isDeleting ? 'Eliminando...' : 'Eliminar'}
            />
        </>
    );
};

export default ProductModal;
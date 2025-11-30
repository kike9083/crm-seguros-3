import React, { useState, useRef } from 'react';
import { bulkCreateLeads, getErrorMessage } from '../services/api';
import Spinner from './Spinner';
import { useAuth } from './auth/AuthContext';
import { LEAD_STATUSES } from '../constants'; // Importar valores válidos

interface ImportModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [previewCount, setPreviewCount] = useState(0);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };

    const parseCSV = async (file: File) => {
        try {
            const text = await file.text();
            const rows = text.split('\n').map(row => row.trim()).filter(row => row);
            
            if (rows.length < 2) {
                setError('El archivo CSV parece estar vacío o solo tiene la cabecera.');
                setPreviewCount(0);
                return;
            }

            const headers = rows[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
            const dataRows = rows.slice(1);
            
            const leads = dataRows.map(row => {
                const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
                const lead: any = {};
                
                headers.forEach((header, index) => {
                    const value = values[index];
                    if (header === 'nombre') lead.nombre = value;
                    if (header === 'email') lead.email = value;
                    // Mapeo de teléfonos
                    if (header === 'telefono' || header === 'telefono1') lead.telefono1 = value;
                    if (header === 'telefono2') lead.telefono2 = value;
                    if (header === 'fuente') lead.fuente = value;
                    if (header === 'estatus') lead.estatus_lead = value;
                    if (header === 'notas') lead.notas = value;
                });

                // --- VALIDACIÓN Y NORMALIZACIÓN DE ESTATUS ---
                if (!lead.estatus_lead || !LEAD_STATUSES.includes(lead.estatus_lead as any)) {
                    lead.estatus_lead = 'PROSPECTO'; 
                }

                if (!lead.fuente) lead.fuente = 'Importado';
                
                // Add system fields
                lead.user_id = user?.id; 
                lead.agent_id = user?.id;

                return lead;
            });

            // Filter out empty rows/objects that might have been created
            const validLeads = leads.filter(l => l.nombre); // Nombre is required

            setParsedData(validLeads);
            setPreviewCount(validLeads.length);
            setError(null);

        } catch (err) {
            console.error("Error parsing CSV", err);
            setError("Error al leer el archivo. Asegúrate de que sea un CSV válido.");
        }
    };

    const handleImport = async () => {
        if (parsedData.length === 0) return;
        
        setIsImporting(true);
        setError(null);

        try {
            await bulkCreateLeads(parsedData);
            onSuccess();
            onClose();
            alert(`¡Éxito! Se han importado ${parsedData.length} leads.`);
        } catch (err) {
            setError(`Error al importar: ${getErrorMessage(err)}`);
        } finally {
            setIsImporting(false);
        }
    };

    const downloadTemplate = () => {
        // Actualizar cabecera de plantilla
        const headers = "Nombre,Email,Telefono1,Telefono2,Fuente,Estatus,Notas";
        const example = "Juan Pérez,juan@ejemplo.com,5512345678,5587654321,Base de Datos,PROSPECTO,Interesado en Vida";
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + example;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "plantilla_leads_v2.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-card rounded-lg shadow-2xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Importar Leads Masivamente</h2>
                
                <div className="space-y-6">
                    <div className="bg-secondary p-4 rounded text-sm text-text-secondary">
                        <p className="mb-2">1. Descarga la plantilla actualizada para ver el formato.</p>
                        <p className="mb-2 text-xs text-yellow-400">
                            Ahora soporta Telefono1 y Telefono2.
                        </p>
                        <button onClick={downloadTemplate} className="text-accent hover:underline font-bold">
                            Descargar Plantilla CSV
                        </button>
                    </div>

                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <input 
                            type="file" 
                            accept=".csv" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden" 
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-primary hover:bg-accent text-white px-4 py-2 rounded transition-colors"
                        >
                            Seleccionar Archivo CSV
                        </button>
                        {file && <p className="mt-2 text-sm text-text-primary">{file.name}</p>}
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    {previewCount > 0 && !error && (
                        <div className="text-green-400 text-center font-medium">
                            {previewCount} leads listos para importar.
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                        <button 
                            onClick={onClose} 
                            className="bg-secondary hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                            disabled={isImporting}
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleImport} 
                            disabled={isImporting || previewCount === 0}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 flex items-center"
                        >
                            {isImporting && <div className="mr-2 transform scale-75"><Spinner /></div>}
                            {isImporting ? 'Importando...' : 'Importar Leads'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportModal;
import React, { useState, useEffect } from 'react';
import { getExpiringPolicies, getLeads, getClients, getPolicies, getProducts, getErrorMessage } from '../services/api';
import { Policy, Lead, Client, Product } from '../types';
import Spinner from './Spinner';
import DocumentArrowDownIcon from './icons/DocumentArrowDownIcon';

const Reports: React.FC = () => {
    const [expiringPolicies, setExpiringPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [days, setDays] = useState(30);

    // State for exporter
    const [exportOptions, setExportOptions] = useState({
        leads: true,
        clients: true,
        policies: true,
        products: true,
    });
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getExpiringPolicies(days);
                setExpiringPolicies(data);
            } catch (err) {
                setError(`No se pudieron cargar las pólizas por vencer: ${getErrorMessage(err)}`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPolicies();
    }, [days]);
    
    const getRelatedName = (relation: { nombre: string } | { nombre: string }[] | null | undefined): string => {
        if (!relation) return 'N/A';
        if (Array.isArray(relation)) {
            return relation.length > 0 ? relation[0].nombre : 'N/A';
        }
        return relation.nombre;
    };

    const handleExportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        setExportOptions(prev => ({ ...prev, [name]: checked }));
    };
    
    const handleExport = async () => {
        setIsExporting(true);
        try {
            let csvContent = "";
            const headers: { [key: string]: string[] } = {
                leads: ['ID', 'Nombre', 'Email', 'Telefono', 'Fuente', 'Estatus', 'Fecha Creacion', 'Agente ID', 'Team ID'],
                clients: ['ID', 'Nombre', 'Email', 'Telefono', 'Fecha Nacimiento', 'Fecha Creacion', 'Agente ID', 'Team ID'],
                policies: ['ID', 'Cliente ID', 'Producto ID', 'Prima Total', 'Comision Agente', 'Estatus', 'Fecha Emision', 'Fecha Vencimiento', 'Agente ID', 'Team ID'],
                products: ['ID', 'Nombre', 'Aseguradora', 'Categoria', 'Precio Base', 'Comision %', 'Activo'],
            };
            
            const toCSVRow = (arr: any[]) => arr.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',');

            if (exportOptions.leads) {
                const data = await getLeads();
                csvContent += "LEADS\n";
                csvContent += toCSVRow(headers.leads) + "\n";
                data.forEach(lead => {
                    csvContent += toCSVRow([lead.id, lead.nombre, lead.email, lead.telefono, lead.fuente, lead.estatus_lead, lead.created_at, lead.agent_id, lead.team_id]) + "\n";
                });
                csvContent += "\n";
            }
            if (exportOptions.clients) {
                const data = await getClients();
                csvContent += "CLIENTES\n";
                csvContent += toCSVRow(headers.clients) + "\n";
                data.forEach(client => {
                    csvContent += toCSVRow([client.id, client.nombre, client.email, client.telefono, client.fecha_nacimiento, client.created_at, client.agent_id, client.team_id]) + "\n";
                });
                csvContent += "\n";
            }
            if (exportOptions.policies) {
                const data = await getPolicies();
                csvContent += "POLIZAS\n";
                csvContent += toCSVRow(headers.policies) + "\n";
                data.forEach(p => {
                    csvContent += toCSVRow([p.id, p.client_id, p.product_id, p.prima_total, p.comision_agente, p.estatus_poliza, p.fecha_emision, p.fecha_vencimiento, p.agent_id, p.team_id]) + "\n";
                });
                csvContent += "\n";
            }
            if (exportOptions.products) {
                const data = await getProducts();
                csvContent += "PRODUCTOS\n";
                csvContent += toCSVRow(headers.products) + "\n";
                data.forEach(p => {
                    csvContent += toCSVRow([p.id, p.nombre, p.aseguradora, p.categoria, p.precio_base, p.comision_porcentaje, p.activo]) + "\n";
                });
            }

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `export_crm_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

        } catch (err) {
            alert(`Error al exportar los datos: ${getErrorMessage(err)}`);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Reportes</h1>
                <p className="text-text-secondary">Analiza el rendimiento y las próximas acciones.</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-4">
                     <h2 className="text-xl font-semibold">Pólizas Próximas a Vencer</h2>
                     <div className="flex items-center space-x-2">
                         <span className="text-sm">Mostrar en los próximos:</span>
                         <select value={days} onChange={e => setDays(Number(e.target.value))} className="bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                             <option value={30}>30 días</option>
                             <option value={60}>60 días</option>
                             <option value={90}>90 días</option>
                         </select>
                     </div>
                </div>

                {loading ? <div className="flex justify-center items-center h-48"><Spinner /></div> :
                 error ? <p className="text-red-500 text-center">{error}</p> :
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-border">
                            <tr>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Producto</th>
                                <th className="p-4">Fecha Vencimiento</th>
                                <th className="p-4">Días Restantes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expiringPolicies.map(policy => {
                                const remainingDays = Math.ceil((new Date(policy.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                                return (
                                <tr key={policy.id} className="border-b border-border hover:bg-secondary">
                                    <td className="p-4 font-medium">{getRelatedName(policy.clients)}</td>
                                    <td className="p-4 text-text-secondary">{getRelatedName(policy.products)}</td>
                                    <td className="p-4 text-text-secondary">{new Date(policy.fecha_vencimiento).toLocaleDateString()}</td>
                                    <td className={`p-4 font-bold ${remainingDays < 15 ? 'text-yellow-400' : 'text-text-secondary'}`}>{remainingDays}</td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {expiringPolicies.length === 0 && (
                        <p className="text-center p-8 text-text-secondary">No hay pólizas que venzan en este período.</p>
                    )}
                 </div>
                }
            </div>
            
             <div className="bg-card p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Exportar Datos</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {Object.keys(exportOptions).map((key) => (
                        <label key={key} className="flex items-center space-x-2 bg-secondary p-3 rounded-lg cursor-pointer hover:bg-gray-600">
                            <input
                                type="checkbox"
                                name={key}
                                checked={exportOptions[key as keyof typeof exportOptions]}
                                onChange={handleExportChange}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="capitalize">{key}</span>
                        </label>
                    ))}
                </div>
                 <button
                    onClick={handleExport}
                    disabled={isExporting || Object.values(exportOptions).every(v => !v)}
                    className="flex items-center justify-center w-full md:w-auto bg-primary hover:bg-accent text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isExporting ? (
                        <>
                            <Spinner />
                            <span className="ml-2">Exportando...</span>
                        </>
                    ) : (
                         <>
                            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                            <span>Exportar a CSV</span>
                        </>
                    )}
                </button>
            </div>

        </div>
    );
};

export default Reports;
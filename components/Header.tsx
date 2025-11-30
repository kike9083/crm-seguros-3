import React from 'react';
import { signOut } from '../services/api';
import { Profile } from '../types';

interface HeaderProps {
    currentView: string;
    profile: Profile;
}

const viewTitles: { [key: string]: string } = {
    dashboard: 'Dashboard',
    pipeline: 'Pipeline de Ventas',
    'leads-list': 'Lista de Leads',
    clients: 'Clientes',
    tasks: 'Tareas y Seguimientos',
    policies: 'Pólizas',
    products: 'Catálogo de Productos',
    settings: 'Configuración',
    reports: 'Reportes',
    guide: 'Guía de Uso',
    commissions: 'Comisiones',
};

const Header: React.FC<HeaderProps> = ({ currentView, profile }) => {
    const handleSignOut = async () => {
        await signOut();
    }

    return (
        <header className="bg-card shadow-md p-4 flex justify-between items-center border-b border-border">
            <h1 className="text-xl md:text-2xl font-bold text-text-primary capitalize">
                {viewTitles[currentView] || 'CRM de Seguros'}
            </h1>
            <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                    <p className="font-semibold">{profile.nombre}</p>
                    <p className="text-xs text-text-secondary capitalize">{profile.rol.toLowerCase()}</p>
                </div>
                <button 
                    onClick={handleSignOut}
                    className="bg-secondary hover:bg-red-700 text-text-primary text-xs font-bold py-2 px-3 rounded-lg transition-colors"
                >
                    Cerrar Sesión
                </button>
            </div>
        </header>
    );
};

export default Header;
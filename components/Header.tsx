
import React from 'react';

interface HeaderProps {
    currentView: string;
}

const viewTitles: { [key: string]: string } = {
    dashboard: 'Dashboard',
    pipeline: 'Pipeline de Ventas',
    clients: 'Clientes',
    tasks: 'Tareas y Seguimientos',
    policies: 'Pólizas',
    products: 'Gestión de Productos',
    reports: 'Reportes',
};

const Header: React.FC<HeaderProps> = ({ currentView }) => {
    return (
        <header className="bg-card shadow-md p-4 flex justify-between items-center border-b border-border">
            <h1 className="text-xl md:text-2xl font-bold text-text-primary capitalize">
                {viewTitles[currentView] || 'CRM de Seguros'}
            </h1>
            <div className="flex items-center space-x-4">
                <span className="text-text-secondary hidden sm:block">Agente de Seguros</span>
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold text-white">
                    AS
                </div>
            </div>
        </header>
    );
};

export default Header;

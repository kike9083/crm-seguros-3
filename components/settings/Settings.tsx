import React, { useState } from 'react';
import ProductsList from '../ProductsList';
import UserManagement from './UserManagement';
import TeamManagement from './TeamManagement';
import { useAuth } from '../auth/AuthContext';

type SettingsTab = 'products' | 'users' | 'teams';

const Settings: React.FC = () => {
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState<SettingsTab>('products');

    if (profile?.rol !== 'ADMIN') {
        return <p className="text-red-500">No tienes permiso para ver esta sección.</p>;
    }

    const tabs: { id: SettingsTab; label: string }[] = [
        { id: 'products', label: 'Gestión de Productos' },
        { id: 'users', label: 'Gestión de Usuarios' },
        { id: 'teams', label: 'Gestión de Equipos' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Configuración</h1>
                <p className="text-text-secondary">Gestiona los productos, usuarios y equipos de la plataforma.</p>
            </div>
            
            <div className="border-b border-border">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-500'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {activeTab === 'products' && <ProductsList />}
                {activeTab === 'users' && <UserManagement />}
                {activeTab === 'teams' && <TeamManagement />}
            </div>
        </div>
    );
};

export default Settings;
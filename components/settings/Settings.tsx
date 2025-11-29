
import React, { useState, useEffect } from 'react';
import UserManagement from './UserManagement';
import GeneralSettings from './GeneralSettings';
import { useAuth } from '../auth/AuthContext';

type SettingsTab = 'team' | 'general';

const Settings: React.FC = () => {
    const { profile } = useAuth();
    const isAdmin = profile?.rol === 'ADMIN';

    // Si no es admin, la pestaña por defecto es 'general', de lo contrario es 'team'.
    const [activeTab, setActiveTab] = useState<SettingsTab>(isAdmin ? 'team' : 'general');

    useEffect(() => {
        // Asegura que si un agente llega a la configuración, siempre vea la pestaña 'general'
        if (!isAdmin && activeTab === 'team') {
            setActiveTab('general');
        }
    }, [isAdmin, activeTab]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Configuración</h1>
                <p className="text-text-secondary">Administra tu equipo y las preferencias de la plataforma.</p>
            </div>
            
            <div className="flex border-b border-border">
                {isAdmin && (
                    <button
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                            activeTab === 'team'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-secondary hover:text-text-primary'
                        }`}
                        onClick={() => setActiveTab('team')}
                    >
                        Equipo
                    </button>
                )}
                <button
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                        activeTab === 'general'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-secondary hover:text-text-primary'
                    }`}
                    onClick={() => setActiveTab('general')}
                >
                    General
                </button>
            </div>

            <div className="mt-6">
                {activeTab === 'team' && isAdmin && (
                    <div className="animate-fade-in">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-text-primary">Gestión de Equipos</h2>
                            <p className="text-sm text-text-secondary">
                                Controla quién tiene acceso a la plataforma, gestiona roles y administra a tus agentes.
                            </p>
                        </div>
                        <UserManagement />
                    </div>
                )}
                {activeTab === 'general' && (
                    <GeneralSettings />
                )}
            </div>
        </div>
    );
};

export default Settings;

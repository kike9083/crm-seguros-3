
import React, { useState } from 'react';
import UserManagement from './UserManagement';
import { useAuth } from '../auth/AuthContext';

const Settings: React.FC = () => {
    const { profile } = useAuth();

    // Aunque la vista ya está protegida por rol en SideNav,
    // esta es una capa extra de seguridad.
    if (profile?.rol !== 'ADMIN') {
        return <p className="text-red-500">No tienes permiso para ver esta sección.</p>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Configuración</h1>
                <p className="text-text-secondary">Gestiona los usuarios de la plataforma.</p>
            </div>
            
            <div>
                <UserManagement />
            </div>
        </div>
    );
};

export default Settings;

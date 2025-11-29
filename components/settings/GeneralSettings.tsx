
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { updateProfileData, updateUserPassword, getErrorMessage } from '../../services/api';
import Spinner from '../Spinner';

const GeneralSettings: React.FC = () => {
    const { profile, user } = useAuth();
    
    // Profile State
    const [nombre, setNombre] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [msgProfile, setMsgProfile] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Password State
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [msgPassword, setMsgPassword] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Preferences State
    const [notifications, setNotifications] = useState(true);

    useEffect(() => {
        if (profile) {
            setNombre(profile.nombre);
        }
    }, [profile]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setLoadingProfile(true);
        setMsgProfile(null);

        try {
            await updateProfileData(profile.id, { nombre });
            setMsgProfile({ type: 'success', text: 'Perfil actualizado correctamente.' });
        } catch (err) {
            setMsgProfile({ type: 'error', text: getErrorMessage(err) });
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingPassword(true);
        setMsgPassword(null);

        if (password.length < 6) {
            setMsgPassword({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
            setLoadingPassword(false);
            return;
        }

        if (password !== confirmPassword) {
            setMsgPassword({ type: 'error', text: 'Las contraseñas no coinciden.' });
            setLoadingPassword(false);
            return;
        }

        try {
            await updateUserPassword(password);
            setMsgPassword({ type: 'success', text: 'Contraseña actualizada correctamente.' });
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setMsgPassword({ type: 'error', text: getErrorMessage(err) });
        } finally {
            setLoadingPassword(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Perfil de Usuario */}
            <div className="bg-card p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-text-primary">Mi Perfil</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Nombre Completo</label>
                        <input 
                            type="text" 
                            value={nombre} 
                            onChange={(e) => setNombre(e.target.value)} 
                            className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                        <input 
                            type="email" 
                            value={user?.email || ''} 
                            disabled 
                            className="w-full bg-secondary p-2 rounded border border-border opacity-60 cursor-not-allowed"
                        />
                        <p className="text-xs text-text-secondary mt-1">El email no se puede cambiar.</p>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-text-secondary mb-1">Rol</label>
                         <input 
                            type="text" 
                            value={profile?.rol || ''} 
                            disabled 
                            className="w-full bg-secondary p-2 rounded border border-border opacity-60 cursor-not-allowed"
                        />
                    </div>

                    {msgProfile && (
                        <p className={`text-sm ${msgProfile.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                            {msgProfile.text}
                        </p>
                    )}

                    <div className="flex justify-end">
                        <button 
                            type="submit" 
                            disabled={loadingProfile}
                            className="bg-primary hover:bg-accent text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 flex items-center"
                        >
                            {loadingProfile && (
                                <div className="mr-2 transform scale-50 origin-center">
                                    <Spinner />
                                </div>
                            )}
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>

            {/* Seguridad */}
            <div className="bg-card p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-text-primary">Seguridad</h2>
                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Nueva Contraseña</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Confirmar Nueva Contraseña</label>
                        <input 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {msgPassword && (
                        <p className={`text-sm ${msgPassword.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                            {msgPassword.text}
                        </p>
                    )}

                    <div className="flex justify-end">
                        <button 
                            type="submit" 
                            disabled={loadingPassword || !password}
                            className="bg-primary hover:bg-accent text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 flex items-center"
                        >
                            {loadingPassword && (
                                <div className="mr-2 transform scale-50 origin-center">
                                    <Spinner />
                                </div>
                            )}
                            Actualizar Contraseña
                        </button>
                    </div>
                </form>
            </div>

            {/* Preferencias */}
             <div className="bg-card p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-text-primary">Preferencias</h2>
                <div className="flex items-center justify-between max-w-lg">
                    <div>
                        <p className="text-text-primary font-medium">Notificaciones por Correo</p>
                        <p className="text-sm text-text-secondary">Recibir alertas sobre tareas vencidas y nuevos leads.</p>
                    </div>
                    <button 
                        onClick={() => setNotifications(!notifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900 ${notifications ? 'bg-primary' : 'bg-gray-600'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GeneralSettings;

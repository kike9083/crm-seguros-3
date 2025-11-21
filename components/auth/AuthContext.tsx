import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { getSession, onAuthStateChange, getProfile, signOut, getErrorMessage } from '../../services/api';
import { Profile } from '../../types';
import Spinner from '../Spinner';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        
        const fetchAndSetProfile = async (session: Session | null) => {
            try {
                setSession(session);
                const currentUser = session?.user ?? null;
                setUser(currentUser);
    
                if (currentUser) {
                    const profileData = await getProfile(currentUser.id);
                    if (profileData) {
                        setProfile(profileData);
                    } else {
                        // This case can happen if the DB trigger for profile creation failed.
                        // We'll rely on the user_metadata as a fallback, but log a warning.
                        console.warn(`No se pudo encontrar un perfil para el usuario ${currentUser.id}. Usando user_metadata como respaldo.`);
                        const { nombre, rol, team_id } = currentUser.user_metadata;
                        if (nombre && rol) {
                            setProfile({ id: currentUser.id, nombre, rol, team_id });
                        } else {
                            throw new Error('Los metadatos del usuario también están incompletos. No se puede establecer el perfil del usuario.');
                        }
                    }
                } else {
                    setProfile(null);
                }
            } catch (err) {
                // FIX: Log the full error object for better debugging, instead of just the message string.
                console.error("Error al establecer la sesión y el perfil:", err);
                // Si hay un error, borramos todo para forzar la salida.
                setProfile(null); 
                setUser(null);
                setSession(null);
                setError(`Error al cargar el perfil de usuario: ${getErrorMessage(err)}`);
            } finally {
                setLoading(false);
            }
        };

        // Fetch initial session
        getSession()
            .then(initialSession => {
                fetchAndSetProfile(initialSession);
            })
            .catch(err => {
                console.error("Error al obtener la sesión inicial:", err);
                setError(`Error al obtener la sesión inicial: ${getErrorMessage(err)}`);
                setLoading(false);
            });

        // Listen for auth changes
        // FIX: The onAuthStateChange wrapper from api.ts returns the subscription object directly
        // and its callback only accepts a single `session` argument. The previous implementation
        // incorrectly tried to destructure a `data` property and passed a callback with two arguments.
        const subscription = onAuthStateChange((session) => {
            // Cuando el estado de autenticación cambia, podemos estar cargando de nuevo.
            setLoading(true);
            fetchAndSetProfile(session);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);
    

    const value = {
        session,
        user,
        profile,
        loading,
    };

    if (loading) {
         return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-2xl text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Ocurrió un Error Crítico</h2>
                    <p className="text-text-secondary mb-6">{error}</p>
                    <button
                        onClick={() => signOut().then(() => setError(null))}
                        className="w-full bg-primary hover:bg-accent text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        Cerrar Sesión e Intentar de Nuevo
                    </button>
                </div>
            </div>
        );
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

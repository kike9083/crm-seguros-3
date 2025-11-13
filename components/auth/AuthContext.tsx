import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { getSession, onAuthStateChange, signOut, getErrorMessage } from '../../services/api';
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

    const handleUserProfile = (currentUser: User) => {
        const { nombre, rol } = currentUser.user_metadata;
        if (nombre && rol) {
            setProfile({ id: currentUser.id, nombre, rol });
        } else {
            const errorMsg = `Los metadatos del perfil (nombre, rol) faltan en el token de usuario. Contacte al administrador para solucionar este problema.`;
            console.error(errorMsg + ` User ID: ${currentUser.id}`);
            throw new Error(errorMsg);
        }
    };

    useEffect(() => {
        const fetchSessionAndProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                const currentSession = await getSession();
                setSession(currentSession);
                const currentUser = currentSession?.user ?? null;
                setUser(currentUser);

                if (currentUser) {
                    handleUserProfile(currentUser);
                } else {
                    setProfile(null);
                }
            } catch (err) {
                console.error("Critical error fetching session:", err);
                setError(`Error al cargar la sesión: ${getErrorMessage(err)}`);
            } finally {
                setLoading(false);
            }
        };

        fetchSessionAndProfile();

        // FIX: The onAuthStateChange wrapper in api.ts returns the subscription directly, not an object with a `data` property.
        // The callback signature was also corrected to accept only one argument (the session), as defined in the wrapper.
        const subscription = onAuthStateChange(async (newSession) => {
             try {
                setLoading(true);
                setError(null);
                const newUser = newSession?.user ?? null;
                setUser(newUser);
                setSession(newSession);
                
                if (newUser) {
                    handleUserProfile(newUser);
                } else {
                    setProfile(null);
                }
            } catch (err) {
                console.error("Critical error on auth state change:", err);
                setError(`Error al actualizar el estado de autenticación: ${getErrorMessage(err)}`);
            } finally {
                setLoading(false);
            }
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
                        onClick={() => signOut()}
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
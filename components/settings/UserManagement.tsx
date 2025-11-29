import React, { useState, useEffect, useCallback } from 'react';
import { getAllProfiles, getErrorMessage } from '../../services/api';
import { Profile } from '../../types';
import Spinner from '../Spinner';
import PlusIcon from '../icons/PlusIcon';
import UserModal from './UserModal';

const UserManagement: React.FC = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchProfiles = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllProfiles();
            setProfiles(data);
        } catch (err) {
            setError(`No se pudieron cargar los usuarios: ${getErrorMessage(err)}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const handleSave = () => {
        setIsModalOpen(false);
        fetchProfiles();
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <>
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center bg-primary hover:bg-accent text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Nuevo Usuario
                </button>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-border">
                            <tr>
                                <th className="p-4">Nombre</th>
                                <th className="p-4">Rol</th>
                                <th className="p-4">ID de Usuario</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profiles.map(profile => (
                                <tr key={profile.id} className="border-b border-border hover:bg-secondary">
                                    <td className="p-4 font-medium">{profile.nombre}</td>
                                    <td className="p-4">
                                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${profile.rol === 'ADMIN' ? 'bg-indigo-500 text-white' : 'bg-gray-500 text-white'}`}>
                                            {profile.rol}
                                        </span>
                                    </td>
                                    <td className="p-4 text-text-secondary text-xs">{profile.id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {profiles.length === 0 && (
                        <p className="text-center p-8 text-text-secondary">No se encontraron usuarios.</p>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <UserModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default UserManagement;
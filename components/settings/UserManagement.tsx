import React, { useState, useEffect, useCallback } from 'react';
import { getAllProfiles, getTeams, updateUserTeam, getErrorMessage } from '../../services/api';
import { Profile, Team } from '../../types';
import Spinner from '../Spinner';
import PlusIcon from '../icons/PlusIcon';
import UserModal from './UserModal';

const UserManagement: React.FC = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [profilesData, teamsData] = await Promise.all([getAllProfiles(), getTeams()]);
            setProfiles(profilesData);
            setTeams(teamsData);
        } catch (err) {
            setError(`No se pudieron cargar los datos: ${getErrorMessage(err)}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = () => {
        setIsModalOpen(false);
        fetchData();
    };

    const handleTeamChange = async (userId: string, teamId: string) => {
        try {
            await updateUserTeam(userId, teamId === 'null' ? null : teamId);
            // Optimistic update
            setProfiles(prev => prev.map(p => p.id === userId ? { ...p, team_id: teamId === 'null' ? undefined : teamId } : p));
        } catch (err) {
            alert(`Error al actualizar el equipo: ${getErrorMessage(err)}`);
            fetchData(); // Revert on error
        }
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
                                <th className="p-4">Equipo</th>
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
                                    <td className="p-4">
                                        <select
                                            value={profile.team_id || 'null'}
                                            onChange={(e) => handleTeamChange(profile.id, e.target.value)}
                                            className="bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="null">Sin equipo</option>
                                            {teams.map(team => (
                                                <option key={team.id} value={team.id}>{team.name}</option>
                                            ))}
                                        </select>
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
                    teams={teams}
                />
            )}
        </>
    );
};

export default UserManagement;
import React, { useState, useEffect, useCallback } from 'react';
import { getTeams, deleteTeam, getErrorMessage } from '../../services/api';
import { Team } from '../../types';
import Spinner from '../Spinner';
import PlusIcon from '../icons/PlusIcon';
import TeamModal from './TeamModal';
import ConfirmationModal from '../ConfirmationModal';

const TeamManagement: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

    const fetchTeams = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getTeams();
            setTeams(data);
        } catch (err) {
            const errorMessage = `No se pudieron cargar los equipos: ${getErrorMessage(err)}`;
            setError(errorMessage);
            // FIX: Add console.error to log the actual error object for debugging,
            // which was missing in this catch block. This helps diagnose issues
            // and prevents silent failures.
            console.error("Error fetching teams:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    const handleOpenModal = (team: Team | null) => {
        setSelectedTeam(team);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTeam(null);
    };

    const handleSave = () => {
        handleCloseModal();
        fetchTeams();
    };

    const handleDeleteRequest = (team: Team) => {
        setTeamToDelete(team);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!teamToDelete) return;
        try {
            await deleteTeam(teamToDelete.id);
            fetchTeams();
        } catch (err) {
            alert(`Error al eliminar el equipo: ${getErrorMessage(err)}`);
        } finally {
            setIsConfirmModalOpen(false);
            setTeamToDelete(null);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <>
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => handleOpenModal(null)}
                    className="flex items-center bg-primary hover:bg-accent text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Nuevo Equipo
                </button>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-border">
                            <tr>
                                <th className="p-4">Nombre del Equipo</th>
                                <th className="p-4">Fecha de Creación</th>
                                <th className="p-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map(team => (
                                <tr key={team.id} className="border-b border-border hover:bg-secondary">
                                    <td className="p-4 font-medium">{team.name}</td>
                                    <td className="p-4 text-text-secondary">{new Date(team.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 space-x-2">
                                        <button onClick={() => handleOpenModal(team)} className="text-accent hover:underline">Editar</button>
                                        <button onClick={() => handleDeleteRequest(team)} className="text-red-500 hover:underline">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {teams.length === 0 && (
                        <p className="text-center p-8 text-text-secondary">No se encontraron equipos.</p>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <TeamModal
                    team={selectedTeam}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que quieres eliminar el equipo "${teamToDelete?.name}"? Los usuarios de este equipo quedarán sin asignar.`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsConfirmModalOpen(false)}
                confirmText="Eliminar"
            />
        </>
    );
};

export default TeamManagement;
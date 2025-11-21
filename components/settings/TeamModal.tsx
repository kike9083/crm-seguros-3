import React, { useState, useEffect } from 'react';
import { createTeam, updateTeam, getErrorMessage } from '../../services/api';
import { Team } from '../../types';

interface TeamModalProps {
    team: Team | null;
    onClose: () => void;
    onSave: () => void;
}

const TeamModal: React.FC<TeamModalProps> = ({ team, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (team) {
            setName(team.name);
        } else {
            setName('');
        }
    }, [team]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            if (team) {
                await updateTeam(team.id, name);
            } else {
                await createTeam(name);
            }
            onSave();
        } catch (err) {
            const message = `Error al guardar el equipo: ${getErrorMessage(err)}`;
            setError(message);
            alert(message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-card rounded-lg shadow-2xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{team ? 'Editar Equipo' : 'Nuevo Equipo'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Nombre del Equipo</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="bg-secondary hover:bg-gray-600 text-white font-bold py-2 px-4 rounded" disabled={isSaving}>Cancelar</button>
                        <button type="submit" className="bg-primary hover:bg-accent text-white font-bold py-2 px-4 rounded" disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeamModal;
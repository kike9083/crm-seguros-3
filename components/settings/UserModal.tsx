
import React, { useState } from 'react';
import { createNewUser, getErrorMessage } from '../../services/api';
import { UserRole } from '../../types';

interface UserModalProps {
    onClose: () => void;
    onSave: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 'AGENTE' as UserRole,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        
        try {
            await createNewUser(formData.email, formData.password, formData.nombre, formData.rol);
            alert('Usuario creado exitosamente.');
            onSave();
        } catch (err) {
            setError(`Error al crear el usuario: ${getErrorMessage(err)}`);
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-card rounded-lg shadow-2xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">Crear Nuevo Usuario</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-text-secondary mb-1">Nombre Completo</label>
                        <input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" required />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                        <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" required />
                    </div>
                     <div>
                        <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">Contraseña</label>
                        <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary" required minLength={6}/>
                         <p className="text-xs text-text-secondary mt-1">Mínimo 6 caracteres.</p>
                    </div>
                    <div>
                        <label htmlFor="rol" className="block text-sm font-medium text-text-secondary mb-1">Rol</label>
                        <select id="rol" name="rol" value={formData.rol} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="AGENTE">Agente</option>
                            <option value="ADMIN">Administrador</option>
                        </select>
                    </div>

                    {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="bg-secondary hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors" disabled={isSaving}>Cancelar</button>
                        <button type="submit" className="bg-primary hover:bg-accent text-white font-bold py-2 px-4 rounded transition-colors" disabled={isSaving}>
                            {isSaving ? 'Creando...' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
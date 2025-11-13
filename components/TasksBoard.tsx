import React, { useState, useEffect, useCallback } from 'react';
import { getTasks, getErrorMessage } from '../services/api';
import { Task, TaskStatus } from '../types';
import { TASK_STATUSES, STATUS_COLORS } from '../constants';
import Spinner from './Spinner';
import TaskModal from './TaskModal';
import PlusIcon from './icons/PlusIcon';

const TaskCard: React.FC<{ task: Task; onClick: () => void }> = ({ task, onClick }) => {
    const getRelatedName = (relation: { nombre: string } | { nombre: string }[] | null | undefined): string | null => {
        if (!relation) return null;
        if (Array.isArray(relation)) {
            return relation.length > 0 ? relation[0].nombre : null;
        }
        return relation.nombre;
    };

    const contactName = getRelatedName(task.leads) || getRelatedName(task.clients) || 'N/A';

    return (
        <div
            onClick={onClick}
            className="bg-secondary p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-600 transition-colors"
        >
            <h3 className="font-bold text-text-primary">{task.descripcion}</h3>
            <p className="text-sm text-text-secondary mt-1">
                Para: {contactName}
            </p>
            <p className="text-xs text-text-secondary mt-2">
                Vence: {new Date(task.fecha_vencimiento).toLocaleDateString()}
            </p>
            <span className={`mt-2 inline-block px-2 py-1 text-xs font-semibold rounded-full ${task.prioridad === 'ALTA' ? 'bg-red-500 text-white' : task.prioridad === 'MEDIA' ? 'bg-yellow-500 text-black' : 'bg-green-500 text-white'}`}>
                {task.prioridad}
            </span>
        </div>
    );
};

const TaskColumn: React.FC<{
    status: TaskStatus;
    tasks: Task[];
    onCardClick: (task: Task) => void;
}> = ({ status, tasks, onCardClick }) => {
    const statusColor = STATUS_COLORS[status] || 'bg-gray-500';

    return (
        <div className="bg-card w-72 md:w-80 flex-shrink-0 rounded-lg shadow-lg">
            <div className={`p-3 rounded-t-lg flex justify-between items-center ${statusColor}`}>
                <h2 className="font-bold text-white capitalize">{status}</h2>
                <span className="text-sm font-semibold text-white bg-black bg-opacity-20 px-2 py-1 rounded-full">{tasks.length}</span>
            </div>
            <div className="p-3 space-y-3 overflow-y-auto h-[calc(100vh-18rem)]">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} onClick={() => onCardClick(task)} />
                ))}
            </div>
        </div>
    );
};


const TasksBoard: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getTasks();
            setTasks(data);
        } catch (err) {
            setError(`No se pudieron cargar las tareas: ${getErrorMessage(err)}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleOpenModal = (task: Task | null) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    const handleSave = () => {
        handleCloseModal();
        fetchTasks();
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => handleOpenModal(null)}
                    className="flex items-center bg-primary hover:bg-accent text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <PlusIcon className="w-5 h-5 mr-2"/>
                    Nueva Tarea
                </button>
            </div>
            <div className="flex-1 flex space-x-4 overflow-x-auto pb-4">
                {TASK_STATUSES.map(status => (
                    <TaskColumn
                        key={status}
                        status={status}
                        tasks={tasks.filter(task => task.estatus === status)}
                        onCardClick={handleOpenModal}
                    />
                ))}
            </div>
            {isModalOpen && (
                <TaskModal
                    task={selectedTask}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default TasksBoard;
import React, { useState, useEffect, useCallback } from 'react';
import { getTasks, updateTask, getErrorMessage, getAllProfiles } from '../services/api';
import { Task, TaskStatus, Profile } from '../types';
import { TASK_STATUSES, STATUS_COLORS } from '../constants';
import Spinner from './Spinner';
import TaskModal from './TaskModal';
import PlusIcon from './icons/PlusIcon';

const TaskCard: React.FC<{ 
    task: Task; 
    onClick: () => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: number) => void;
    isDragging: boolean;
    agentName: string | null;
}> = ({ task, onClick, onDragStart, isDragging, agentName }) => {
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
            draggable
            onDragStart={(e) => onDragStart(e, task.id)}
            onClick={onClick}
            className={`bg-secondary p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-600 transition-all duration-200 ${isDragging ? 'opacity-50 scale-105' : 'opacity-100'}`}
            aria-grabbed={isDragging}
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
            {agentName && <div className="mt-2 text-xs text-blue-300">Agente: {agentName}</div>}
        </div>
    );
};

const TaskColumn: React.FC<{
    status: TaskStatus;
    tasks: Task[];
    onCardClick: (task: Task) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: number) => void;
    draggedTaskId: number | null;
    agentMap: Map<string, string>;
}> = ({ status, tasks, onCardClick, onDrop, onDragStart, draggedTaskId, agentMap }) => {
    const [isDraggedOver, setIsDraggedOver] = useState(false);
    const statusColor = STATUS_COLORS[status] || 'bg-gray-500';

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Necesario para permitir el drop
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggedOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        setIsDraggedOver(false);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggedOver(false);
        onDrop(e, status);
    };

    return (
        <div 
            className={`bg-card w-72 md:w-80 flex-shrink-0 rounded-lg shadow-lg transition-colors duration-300 ${isDraggedOver ? 'bg-gray-700' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            aria-dropeffect="move"
        >
            <div className={`p-3 rounded-t-lg flex justify-between items-center ${statusColor}`}>
                <h2 className="font-bold text-white capitalize">{status}</h2>
                <span className="text-sm font-semibold text-white bg-black bg-opacity-20 px-2 py-1 rounded-full">{tasks.length}</span>
            </div>
            <div className="p-3 space-y-3 overflow-y-auto h-[calc(100vh-18rem)]">
                {tasks.map(task => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        onClick={() => onCardClick(task)}
                        onDragStart={onDragStart}
                        isDragging={draggedTaskId === task.id}
                        agentName={task.agent_id ? agentMap.get(task.agent_id) : null}
                    />
                ))}
            </div>
        </div>
    );
};


const TasksBoard: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

    const agentMap = React.useMemo(() => {
        const map = new Map<string, string>();
        profiles.forEach(p => map.set(p.id, p.nombre));
        return map;
    }, [profiles]);

    const fetchTasksAndProfiles = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [tasksData, profilesData] = await Promise.all([
                getTasks(),
                getAllProfiles()
            ]);
            setTasks(tasksData);
            setProfiles(profilesData);
        } catch (err) {
            setError(`No se pudieron cargar las tareas o perfiles: ${getErrorMessage(err)}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasksAndProfiles();
    }, [fetchTasksAndProfiles]);

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
        fetchTasksAndProfiles();
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: number) => {
        e.dataTransfer.setData('taskId', taskId.toString());
        e.dataTransfer.effectAllowed = "move";
        setDraggedTaskId(taskId);
    };
    
    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, newStatus: TaskStatus) => {
        const taskIdStr = e.dataTransfer.getData('taskId');
        if (!taskIdStr) return;
        const taskId = parseInt(taskIdStr, 10);
        setDraggedTaskId(null);
        
        const taskToMove = tasks.find(t => t.id === taskId);
        if (!taskToMove || taskToMove.estatus === newStatus) {
            return; // No hay cambios o la tarea no se encontró
        }

        // Actualización optimista de la UI
        const originalTasks = [...tasks];
        const updatedTasks = tasks.map(t => 
            t.id === taskId ? { ...t, estatus: newStatus } : t
        );
        setTasks(updatedTasks);

        try {
            // Llamada a la API para persistir el cambio
            const { leads, clients, ...taskDataForUpdate } = taskToMove;
            
            await updateTask(taskId, {
                ...taskDataForUpdate,
                estatus: newStatus,
            });
            
        } catch (err) {
            // Revertir la UI en caso de error
            setTasks(originalTasks);
            setError(`Error al actualizar la tarea: ${getErrorMessage(err)}`);
            console.error(err);
            alert(`No se pudo mover la tarea. Error: ${getErrorMessage(err)}`);
        }
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
                        onDrop={handleDrop}
                        onDragStart={handleDragStart}
                        draggedTaskId={draggedTaskId}
                        agentMap={agentMap}
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
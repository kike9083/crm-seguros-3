import React from 'react';
import ChartBarIcon from './icons/ChartBarIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import CogIcon from './icons/CogIcon';
import PresentationChartLineIcon from './icons/PresentationChartLineIcon';
import TagIcon from './icons/TagIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import ListBulletIcon from './icons/ListBulletIcon';
import { Profile } from '../types';

type View = 'dashboard' | 'pipeline' | 'leads-list' | 'clients' | 'tasks' | 'policies' | 'products' | 'settings' | 'reports' | 'guide';

interface SideNavProps {
    currentView: View;
    setCurrentView: (view: View) => void;
    profile: Profile;
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon, roles: ['ADMIN', 'AGENTE'] },
    { id: 'pipeline', label: 'Pipeline', icon: ClipboardListIcon, roles: ['ADMIN', 'AGENTE'] },
    { id: 'leads-list', label: 'Lista Leads', icon: ListBulletIcon, roles: ['ADMIN', 'AGENTE'] },
    { id: 'clients', label: 'Clientes', icon: UserGroupIcon, roles: ['ADMIN', 'AGENTE'] },
    { id: 'tasks', label: 'Tareas', icon: ClipboardListIcon, roles: ['ADMIN', 'AGENTE'] },
    { id: 'policies', label: 'Pólizas', icon: DocumentTextIcon, roles: ['ADMIN', 'AGENTE'] },
    { id: 'products', label: 'Productos', icon: TagIcon, roles: ['ADMIN', 'AGENTE'] },
    { id: 'reports', label: 'Reportes', icon: PresentationChartLineIcon, roles: ['ADMIN', 'AGENTE'] },
    { id: 'guide', label: 'Guía', icon: InformationCircleIcon, roles: ['ADMIN', 'AGENTE'] },
    { id: 'settings', label: 'Configuración', icon: CogIcon, roles: ['ADMIN', 'AGENTE'] },
] as const;


const SideNav: React.FC<SideNavProps> = ({ currentView, setCurrentView, profile }) => {
    return (
        <nav className="w-20 lg:w-64 bg-card p-2 lg:p-4 flex flex-col border-r border-border">
            <div className="flex items-center justify-center lg:justify-start mb-10">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  S
                </div>
                <h1 className="text-2xl font-bold ml-4 hidden lg:block">SeguroCRM</h1>
            </div>
            <ul className="space-y-2">
                {navItems.filter(item => {
                    return (item.roles as readonly string[]).includes(profile.rol);
                }).map(item => (
                    <li key={item.id}>
                        <button
                            onClick={() => setCurrentView(item.id)}
                            className={`w-full flex items-center p-3 rounded-lg transition-colors
                                ${currentView === item.id ? 'bg-accent text-white' : 'hover:bg-secondary text-text-secondary'}`}
                        >
                            <item.icon className="w-6 h-6" />
                            <span className="ml-4 hidden lg:block">{item.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default SideNav;
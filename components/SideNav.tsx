
import React from 'react';
import ChartBarIcon from './icons/ChartBarIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import CogIcon from './icons/CogIcon';
import PresentationChartLineIcon from './icons/PresentationChartLineIcon';

type View = 'dashboard' | 'pipeline' | 'clients' | 'tasks' | 'policies' | 'products' | 'reports';

interface SideNavProps {
    currentView: View;
    setCurrentView: (view: View) => void;
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'pipeline', label: 'Pipeline', icon: ClipboardListIcon },
    { id: 'clients', label: 'Clientes', icon: UserGroupIcon },
    { id: 'tasks', label: 'Tareas', icon: ClipboardListIcon },
    { id: 'policies', label: 'Pólizas', icon: DocumentTextIcon },
    { id: 'products', label: 'Productos', icon: CogIcon },
    { id: 'reports', label: 'Reportes', icon: PresentationChartLineIcon },
] as const;


const SideNav: React.FC<SideNavProps> = ({ currentView, setCurrentView }) => {
    return (
        <nav className="w-20 lg:w-64 bg-card p-2 lg:p-4 flex flex-col border-r border-border">
            <div className="flex items-center justify-center lg:justify-start mb-10">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  S
                </div>
                <h1 className="text-2xl font-bold ml-4 hidden lg:block">SeguroCRM</h1>
            </div>
            <ul className="space-y-2">
                {navItems.map(item => (
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

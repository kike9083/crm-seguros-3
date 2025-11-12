
import React, { useState, useCallback } from 'react';
import SideNav from './components/SideNav';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PipelineBoard from './components/PipelineBoard';
import ClientsList from './components/ClientsList';
import TasksBoard from './components/TasksBoard';
import PoliciesList from './components/PoliciesList';
import ProductsList from './components/ProductsList';
import Reports from './components/Reports';

type View = 'dashboard' | 'pipeline' | 'clients' | 'tasks' | 'policies' | 'products' | 'reports';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('dashboard');

    const renderView = useCallback(() => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard />;
            case 'pipeline':
                return <PipelineBoard />;
            case 'clients':
                return <ClientsList />;
            case 'tasks':
                return <TasksBoard />;
            case 'policies':
                return <PoliciesList />;
            case 'products':
                return <ProductsList />;
            case 'reports':
                return <Reports />;
            default:
                return <Dashboard />;
        }
    }, [currentView]);

    return (
        <div className="flex h-screen bg-background text-text-primary">
            <SideNav currentView={currentView} setCurrentView={setCurrentView} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header currentView={currentView} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};

export default App;

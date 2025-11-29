import React from 'react';
import { AuthProvider } from './components/auth/AuthContext';
import Auth from './components/auth/Auth';
import SideNav from './components/SideNav';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PipelineBoard from './components/PipelineBoard';
import ClientsList from './components/ClientsList';
import TasksBoard from './components/TasksBoard';
import PoliciesList from './components/PoliciesList';
import Settings from './components/settings/Settings';
import ProductsList from './components/ProductsList';
import { Profile } from './types';
import Reports from './components/Reports';
import Guide from './components/Guide';
import LeadsList from './components/LeadsList';

type View = 'dashboard' | 'pipeline' | 'leads-list' | 'clients' | 'tasks' | 'policies' | 'products' | 'settings' | 'reports' | 'guide';

interface MainAppProps {
    profile: Profile;
}

const MainApp: React.FC<MainAppProps> = ({ profile }) => {
    const [currentView, setCurrentView] = React.useState<View>('dashboard');

    const renderView = React.useCallback(() => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard />;
            case 'pipeline':
                return <PipelineBoard />;
            case 'leads-list':
                return <LeadsList />;
            case 'clients':
                return <ClientsList />;
            case 'tasks':
                return <TasksBoard />;
            case 'policies':
                return <PoliciesList />;
            case 'products':
                return <ProductsList />;
            case 'settings':
                return <Settings />;
            case 'reports':
                return <Reports />;
            case 'guide':
                return <Guide />;
            default:
                return <Dashboard />;
        }
    }, [currentView]);

    return (
        <div className="flex h-screen bg-background text-text-primary">
            <SideNav currentView={currentView} setCurrentView={setCurrentView} profile={profile} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header currentView={currentView} profile={profile} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    return (
        <AuthProvider>
            <Auth>
                {(profile) => <MainApp profile={profile} />}
            </Auth>
        </AuthProvider>
    );
};

export default App;
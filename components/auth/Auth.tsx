
import React from 'react';
import { useAuth } from './AuthContext';
import Login from './Login';
import Spinner from '../Spinner';
import { Profile } from '../../types';

interface AuthProps {
    children: (profile: Profile) => React.ReactNode;
}

const Auth: React.FC<AuthProps> = ({ children }) => {
    const { session, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner />
            </div>
        );
    }
    
    if (!session || !profile) {
        return <Login />;
    }

    return <>{children(profile)}</>;
};

export default Auth;

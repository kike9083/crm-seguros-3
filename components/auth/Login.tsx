import React, { useState } from 'react';
import { signInWithPassword, signUp, getErrorMessage } from '../../services/api';

const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error: signInError } = await signInWithPassword(email, password);
                if (signInError) throw signInError;
            } else {
                const { error: signUpError } = await signUp(email, password, nombre);
                if (signUpError) {
                    throw signUpError;
                } else {
                    alert('¡Registro exitoso! Por favor, revisa tu email para verificar tu cuenta.');
                    setIsLogin(true); // Switch to login view after successful signup
                }
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto">
                        S
                    </div>
                    <h1 className="text-3xl font-bold mt-4">SeguroCRM</h1>
                    <p className="text-text-secondary">{isLogin ? 'Inicia sesión para continuar' : 'Crea una nueva cuenta'}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                         <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-text-secondary mb-1">Nombre Completo</label>
                            <input
                                id="nombre"
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="w-full bg-secondary p-3 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-secondary p-3 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-secondary p-3 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-accent text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                        </button>
                    </div>
                </form>
                
                <div className="mt-6 text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-accent hover:underline">
                        {isLogin ? '¿No tienes una cuenta? Regístrate' : '¿Ya tienes una cuenta? Inicia Sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
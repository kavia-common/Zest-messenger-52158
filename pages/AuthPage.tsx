import React, { useState } from 'react';
import { handleLogin, handleSignUp, handleGoogleSignIn } from '../backend/services';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import { User } from '../types';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isLogin && !name) {
      setError('Please enter your name.');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
    }

    try {
      let user: User | null = null;
      if (isLogin) {
        user = await handleLogin({ email, password });
      } else {
        user = await handleSignUp({ name, email, password });
      }
      setCurrentUser(user);
      // On success, AuthGate will see the new currentUser and show the app.
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
        setLoading(false);
    }
  };
  
  const onGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await handleGoogleSignIn();
      setCurrentUser(user);
    } catch(err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-black rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Welcome to Zest
        </h1>
        <p className="text-center text-gray-500 mb-8">
          {isLogin ? 'Sign in to your account' : 'Create an account to get started'}
        </p>
        
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border-transparent rounded-md focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border-transparent rounded-md focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border-transparent rounded-md focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-600 text-white font-semibold rounded-md hover:bg-brand-700 transition-colors disabled:bg-brand-400"
          >
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-black text-gray-500">Or continue with</span>
          </div>
        </div>

        <button onClick={onGoogleSignIn} disabled={loading} className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
            <Icon name="google" className="w-5 h-5 mr-2" />
            Sign in with Google
        </button>

        <p className="mt-8 text-center text-sm text-gray-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-brand-600 hover:text-brand-500 ml-1">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
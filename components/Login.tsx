
import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { Rocket, Lock, Mail, Loader2, UserPlus } from 'lucide-react';

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (isSignUp) {
        await StorageService.auth.signUp(email, password);
        setSuccess('Account created successfully! You can now sign in.');
        setIsSignUp(false); // Switch back to login
      } else {
        await StorageService.auth.signIn(email, password);
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-primary p-8 text-center transition-colors duration-300">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            {isSignUp ? <UserPlus className="text-white" size={32} /> : <Rocket className="text-white" size={32} />}
          </div>
          <h1 className="text-2xl font-bold text-white">{isSignUp ? 'Create Account' : 'Project Tracker GM'}</h1>
          <p className="text-blue-100 mt-2 text-sm">{isSignUp ? 'Register a new administrative account' : 'Executive Management Console'}</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="gm@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg border border-green-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                {success}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>
          
          <div className="mt-6 text-center space-y-4">
             <button 
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
                className="text-sm text-primary hover:text-primary-dark font-medium hover:underline"
             >
                {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
             </button>
             {!isSignUp && (
                <p className="text-xs text-gray-400">Restricted Access. Authorized Personnel Only.</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

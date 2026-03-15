import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#d4a843]/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <span className="text-[#d4a843] text-7xl inline-block mb-4 drop-shadow-[0_0_15px_rgba(212,168,67,0.3)]">♚</span>
        <h2 className="mt-2 text-center text-4xl font-black tracking-tight text-white uppercase italic">
          Join the Ranks
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400 font-medium">
          Already a member?{' '}
          <Link to="/login" className="font-bold text-[#d4a843] hover:text-[#e5bf5e] transition-colors underline decoration-transparent hover:decoration-[#e5bf5e]">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#141414] py-8 px-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[#2a2a2a] sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm font-bold text-center">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-xs font-black uppercase tracking-widest text-gray-400">
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-xl border-0 bg-[#0f0f0f] p-3 text-white shadow-inner ring-1 ring-inset ring-[#2a2a2a] focus:ring-2 focus:ring-inset focus:ring-[#d4a843] sm:text-sm transition-all"
                  placeholder="Kasparov99"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-gray-400">
                Email Address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border-0 bg-[#0f0f0f] p-3 text-white shadow-inner ring-1 ring-inset ring-[#2a2a2a] focus:ring-2 focus:ring-inset focus:ring-[#d4a843] sm:text-sm transition-all"
                  placeholder="grandmaster@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-black uppercase tracking-widest text-gray-400">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 bg-[#0f0f0f] p-3 text-white shadow-inner ring-1 ring-inset ring-[#2a2a2a] focus:ring-2 focus:ring-inset focus:ring-[#d4a843] sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-xl bg-[#d4a843] py-3 px-4 text-sm font-black uppercase tracking-widest text-[#0f0f0f] shadow-lg hover:bg-[#e5bf5e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4a843] transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {isLoading ? 'Creating Account...' : 'Pledge Allegiance'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

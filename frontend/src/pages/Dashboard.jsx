import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkAuth } from '../auth/auth.js';
import Companion from '../components/Companion.jsx';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [companions, setCompanions] = useState([]);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const authData = await checkAuth();
      if (!authData.success) {
        navigate('/login', { replace: true });
      } else {
        try {
          const rest = await fetch(import.meta.env.VITE_GET_USER_API_URL,{
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
          });
          const data = await rest.json();
          const User = data.user;
          setUserName(User.name);
          setUserAvatar(User.avatar);
          setCompanions(User.companions);
        } catch (error) {
          console.error("Failed to load companions:", error);
        }
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading your companions...</p>
      </div>
    </div>
  );

  const handleDeleteCompanion = async (companionId) => {
    try {
      const res = await fetch(import.meta.env.VITE_DELETE_COMPANION_API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companionId }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setCompanions(prev => prev.filter(c => c._id !== companionId));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Delete companion failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background glows */}
      <div className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      {/* Topbar */}
      <header className="relative z-10 border-b border-white/5 bg-white/3 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">AI Companion</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {userName && (
              <span className="hidden sm:block text-slate-300 font-medium text-sm uppercase tracking-wider">
                {userName.split(' ')[0]}
              </span>
            )}
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 border border-white/10 flex items-center justify-center hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-slate-400 hover:text-white overflow-hidden shrink-0"
              title="Profile Settings"
            >
              {userAvatar ? (
                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-semibold text-lg">
                  {userName ? userName.charAt(0).toUpperCase() : '?'}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">My Companions</h1>
            <p className="text-slate-400 text-sm mt-1">
              {companions.length === 0
                ? "You don't have any companions yet"
                : `${companions.length} companion${companions.length !== 1 ? 's' : ''} in your squad`
              }
            </p>
          </div>
          <button
            onClick={() => navigate("/createCompanion")}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Companion
          </button>
        </div>

        {/* Companions grid */}
        {companions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-white/10 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Ready to meet your AI squad?</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">Create your first companion and start building your personal AI team.</p>
            <button
              onClick={() => navigate("/createCompanion")}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-indigo-500/40 hover:-translate-y-0.5 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create First Companion
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {companions.map((comp, index) => (
              <Companion
                key={comp._id || index}
                companion={comp}
                onDelete={handleDeleteCompanion}
              />
            ))}
          </div>
        )}
      </main>

    </div>
  );
};

export default Dashboard;
